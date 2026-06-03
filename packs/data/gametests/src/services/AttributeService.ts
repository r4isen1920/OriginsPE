import { Player } from '@minecraft/server';

import { NS } from '../Constants';
import { Log } from '../utils/Log';
import {
	AttributeKey,
	AttributeOverrides,
	DEFAULT_ATTRIBUTES,
	PlayerAttributes,
	STEPPED_ATTRIBUTES,
} from './Attributes';


//#region SERVICE

/**
 * Centralized attribute applier and the single abstraction layer over player attributes.
 */
export class AttributeService {
	private static readonly log = Log.get('AttributeService');
	private static readonly applied = new Map<string, Partial<PlayerAttributes>>();


	//#region APPLY

	/** Applies the given attributes. Only acts on keys that changed. */
	static apply(player: Player, attrs: AttributeOverrides): void {
		const last = this.applied.get(player.id) ?? {};
		const next: Partial<PlayerAttributes> = { ...last };

		for (const key of Object.keys(DEFAULT_ATTRIBUTES) as AttributeKey[]) {
			const value = attrs[key];
			if (value === undefined) continue;
			if (last[key] === value) continue;
			next[key] = value;
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

	private static trigger(player: Player, key: AttributeKey, value: PlayerAttributes[AttributeKey]): void {
		const stepped = STEPPED_ATTRIBUTES[key];
		if (stepped) {
			const snapped = this.snap(value as number, stepped.steps);
			this.fireEvent(player, `${stepped.event}.${snapped}`);
			return;
		}

		this.fireEvent(player, `${this.eventNameFor(key)}.${value}`);
	}

	/** Fires a namespaced entity event, logging any failure. */
	private static fireEvent(player: Player, suffix: string): void {
		const eventName = `${NS}:${suffix}`;
		try {
			player.triggerEvent(eventName);
		} catch (e: any) {
			this.log.error(`triggerEvent '${eventName}' failed: ${e?.stack ?? e}`);
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
