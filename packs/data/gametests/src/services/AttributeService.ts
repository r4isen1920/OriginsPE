import { Player } from '@minecraft/server';

import { Log } from '../utils/Log';
import {
	type AttributeKey,
	type AttributeOverrides,
	type PlayerAttributes,
	type PropertyAttributeOverrides,
	DEFAULT_ATTRIBUTES,
	PROPERTY_ATTRIBUTES,
	STEPPED_ATTRIBUTES,
} from './Attributes';


//#region SERVICE

/**
 * Handles attribute application and provides a single abstraction layer over player attributes.
 */
export class AttributeService {
	private static readonly log = Log.get('AttributeService');
	private static readonly applied = new Map<string, Partial<PlayerAttributes>>();


	//#region APPLY

	/**
	 * Applies the given attributes. Only acts on keys that changed.
	 *
	 * @param force
	 * Pass `force` to re-fire every supplied key regardless of the diff cache.
	 * This is required on origin/class change because some powers set attributes
	 * (e.g. `scale`/`health`) through direct entity events that bypass this
	 * service, leaving the cache out of sync; forcing guarantees the target
	 * profile is fully reasserted rather than silently skipped.
	 */
	static apply(player: Player, attrs: AttributeOverrides, force = false): void {
		const last = this.applied.get(player.id) ?? {};
		const next: Partial<PlayerAttributes> = { ...last };

		const keys = Object.keys(DEFAULT_ATTRIBUTES) as AttributeKey[];
		for (const key of keys) {
			const value = attrs[key];
			if (value === undefined) continue;
			if (!force && last[key] === value) continue;
			if (typeof value === 'object' || Array.isArray(value)) continue; // not primitive, skip
			const mutableNext = next as Partial<Record<AttributeKey, PlayerAttributes[AttributeKey]>>;
			mutableNext[key] = value;
			this.trigger(player, key, value);
		}

		// Camera: store explicit override in cache; CameraService handles all side-effects.
		if ('camera' in attrs) {
			next.camera = attrs.camera;
		} else if (force) {
			// Force-refresh clears any stale explicit override not re-supplied.
			next.camera = undefined;
		}

		this.applied.set(player.id, next);
	}

	/** Resets the player to {@link DEFAULT_ATTRIBUTES}. */
	static reset(player: Player): void {
		// Force a fresh apply by clearing the diff cache.
		this.applied.delete(player.id);
		this.apply(player, DEFAULT_ATTRIBUTES);
	}

	/** Drops the diff cache for a player (call on leave). */
	static forget(playerId: string): void {
		this.applied.delete(playerId);
	}

	/** Returns the full applied attribute for the specified `playerId`. */
	static getApplied(playerId: string): Readonly<Partial<PlayerAttributes>> {
		return this.applied.get(playerId) ?? {};
	}


	//#region INTERNAL

	private static trigger<K extends AttributeKey>(player: Player, key: K, value: PlayerAttributes[K]): void {
		const propId = (PROPERTY_ATTRIBUTES as Record<string, string | undefined>)[key];
		if (propId !== undefined) {
			this.applyActorProperty(player, propId, value as string | number | boolean);
			return;
		}

		const stepped = STEPPED_ATTRIBUTES[key];
		if (stepped) {
			const snapped = this.snap(value as number, stepped.steps);
			this.fireEvent(player, `${stepped.event}.${snapped}`);
			return;
		}

		this.fireEvent(player, `${this.eventNameFor(key)}.${value}`);
	}

	/**
	 * Fires a namespaced entity event, ensures a valid event ran, with error handling wrapping.
	 * @player Who to trigger the event for.
	 * @event The event to trigger. When passed without the namespace prefix, it will be added automatically. Must be a non-empty string.
	 * @returns Whether the event was successfully triggered.
	 */
	public static fireEvent(player: Player, event: string): boolean {
		if (!event || typeof event === 'object' || Array.isArray(event) || String(event).trim() === '') {
			this.log.error(`Invalid event passed: ${event}. Aborting event invocation...`);
			return false;
		}

		let eventName = event;
		if (!event.startsWith('r4isen1920_originspe')) {
			eventName = `r4isen1920_originspe:${event}`;
		}

		try {
        	player.triggerEvent(eventName);
			return true;
    	} catch (e) {
        	this.log.error(`triggerEvent '${eventName}' failed: ${e}`);
    	}
		return false;
	}

	/**
	 * Applies actor-property overrides on `target` as seen from `holder`'s perspective.
	 * Uses the experimental setPropertyOverrideForEntity API.
	 * @param holder The player who is "holding" the target (e.g. the one who can see the override).
	 * @param target The player whose properties are being overridden.
	 * @param attrs The property attributes to override.
	 */
	static applyOverride(holder: Player, target: Player, attrs: PropertyAttributeOverrides): void {
		for (const [key, value] of Object.entries(attrs) as [string, PlayerAttributes[keyof PlayerAttributes]][]) {
			const propId = (PROPERTY_ATTRIBUTES as Record<string, string | undefined>)[key];
			if (!propId || value === undefined) continue;
			try {
				(holder as any).setPropertyOverrideForEntity(target, propId, value);
			} catch (e: any) {
				this.log.error(`setPropertyOverrideForEntity '${propId}' = '${String(value)}' on '${target.id}' failed: ${e}`);
			}
		}
	}

	private static applyActorProperty(player: Player, propId: string, value: string | number | boolean): void {
		try {
			player.setProperty(propId, value);
		} catch (e: any) {
			this.log.error(`setProperty '${propId}' = '${String(value)}' failed: ${e}`);
		}
	}

	/** Returns the entry of `steps` closest to `value`. */
	private static snap(value: number, steps: readonly number[]): number {
		let best = steps[0];
		let bestDist = Math.abs(value - best);
		for (let i = 1; i < steps.length; i++) {
			const dist = Math.abs(value - steps[i]);
			if (dist < bestDist) {
				best = steps[i];
				bestDist = dist;
			}
		}
		return best;
	}

	private static eventNameFor(key: AttributeKey): string {
		// The data-driven events use snake_case suffixes. Map camelCase keys back.
		switch (key) {
			case 'familyType': return 'family_type';
			case 'isShaking': return 'is_shaking';
			case 'burnsInDaylight': return 'burns_in_daylight';
			case 'displayName': return 'display_name';
			default: return key;
		}
	}
}
