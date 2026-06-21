import { Player } from '@minecraft/server';

import { Log } from '../utils/Log';
import {
	type AttributeKey,
	type AttributeOverrides,
	type PlayerAttributes,
	DEFAULT_ATTRIBUTES,
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

	/** Applies the given attributes. Only acts on keys that changed. */
	static apply(player: Player, attrs: AttributeOverrides): void {
		const last = this.applied.get(player.id) ?? {};
		const next: Partial<PlayerAttributes> = { ...last };

		const keys = Object.keys(DEFAULT_ATTRIBUTES) as AttributeKey[];
		for (const key of keys) {
			const value = attrs[key];
			if (value === undefined) continue;
			if (last[key] === value) continue;
			if (typeof value === 'object' || Array.isArray(value)) continue; // not primitive, skip
			const mutableNext = next as Partial<Record<AttributeKey, PlayerAttributes[AttributeKey]>>;
			mutableNext[key] = value;
			this.trigger(player, key, value);
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


	//#region INTERNAL

	private static trigger<K extends AttributeKey>(player: Player, key: K, value: PlayerAttributes[K]): void {
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
