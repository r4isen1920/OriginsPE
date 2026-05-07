import { Player } from '@minecraft/server';

import { NS } from '../Constants';
import { Log } from '../utils/Log';


//#region TYPES

/**
 * Immutable snapshot of attribute values applied via the data-driven entity
 * events on `r4isen1920_originspe:player`. Keys map 1:1 to event suffixes.
 */
export interface AttributeSet {
	/** e.g. "0.1" */
	movement: string;
	/** e.g. "0.025" */
	underwaterMovement: string;
	/** e.g. "20" */
	health: string;
	/** e.g. "1" */
	attack: string;
	/** e.g. "1" */
	scale: string;
	/** "normal" | other named exhaustion profiles */
	exhaustion: string;
	/** e.g. "player" | "undead" */
	familyType: string;
	/** "land" | "water" | etc. */
	breathable: string;
	/** "normal" | etc. */
	buoyant: string;
	/** "reset" | named projectile profiles */
	projectileSpawner: string;
	/** "true" | "false" */
	isShaking: string;
	/** "true" | "false" */
	burnsInDaylight: string;
	/** "true" | "false" */
	displayName: string;
	/** "true" | "false" */
	hasDivineAura: string;
}

/** Default attribute profile applied on origin/class change. */
export const DEFAULT_ATTRIBUTES: AttributeSet = Object.freeze({
	movement: '0.1',
	underwaterMovement: '0.025',
	health: '20',
	attack: '1',
	scale: '1',
	exhaustion: 'normal',
	familyType: 'player',
	breathable: 'land',
	buoyant: 'normal',
	projectileSpawner: 'reset',
	isShaking: 'false',
	burnsInDaylight: 'false',
	displayName: 'true',
	hasDivineAura: 'false',
});


//#region SERVICE

/**
 * Centralized attribute applier. Translates an {@link AttributeSet} into the
 * smallest possible set of `Entity.triggerEvent` calls and skips redundant
 * triggers via per-player diffing.
 *
 * Replaces the loose `resetPlayerAttributes` chain in the legacy `player.ts`.
 */
export class AttributeService {
	private static readonly log = Log.get('AttributeService');
	private static readonly applied = new Map<string, Partial<AttributeSet>>();

	/** Applies the given attributes. Only triggers events for keys that changed. */
	static apply(player: Player, attrs: Partial<AttributeSet>): void {
		const last = this.applied.get(player.id) ?? {};
		const next: Partial<AttributeSet> = { ...last };

		for (const key of Object.keys(attrs) as Array<keyof AttributeSet>) {
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

	private static trigger(player: Player, key: keyof AttributeSet, value: string): void {
		const eventName = `${NS}:${this.eventNameFor(key)}.${value}`;
		try {
			player.triggerEvent(eventName);
		} catch (e: any) {
			this.log.error(`triggerEvent '${eventName}' failed: ${e?.stack ?? e}`);
		}
	}

	private static eventNameFor(key: keyof AttributeSet): string {
		// The data-driven events use snake_case suffixes. Map camelCase keys back.
		switch (key) {
			case 'underwaterMovement': return 'underwater_movement';
			case 'familyType': return 'family_type';
			case 'projectileSpawner': return 'projectile_spawner';
			case 'isShaking': return 'is_shaking';
			case 'burnsInDaylight': return 'burns_in_daylight';
			case 'displayName': return 'display_name';
			case 'hasDivineAura': return 'has_divine_aura';
			default: return key;
		}
	}
}
