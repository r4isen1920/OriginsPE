import { EntityAttributeComponent, Player } from '@minecraft/server';

import { NS } from '../Constants';
import { PlayerState } from '../core/PlayerState';
import { Log } from '../utils/Log';


//#region DEFAULTS

/** Default attribute profile applied on origin/class change. */
export const DEFAULT_ATTRIBUTES = Object.freeze({
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
});

type AttributeKey = keyof typeof DEFAULT_ATTRIBUTES;
type AttributeOverrides = Partial<Record<AttributeKey, string>>;

/** Player max-health bounds. Mirrors the BP `minecraft:health` component range. */
const MIN_MAX_HEALTH = 1;
const MAX_MAX_HEALTH = 150;

/**
 * Flag key tracking the player's definitive max health. Replaces the removed
 * `r4isen1920_originspe:definitive_max_health` actor property and powers the
 * Diviner origin's bespoke abilities through {@link PlayerState}.
 */
const DEFINITIVE_MAX_HEALTH_FLAG = 'definitive_max_health';

/**
 * Numeric attribute keys backed directly by an {@link EntityAttributeComponent}.
 * These are adjusted through `setCurrentValue` (clamped to the component's
 * effective bounds) instead of triggering a data-driven entity event.
 */
const NUMERIC_COMPONENT_IDS: Partial<Record<AttributeKey, string>> = {
	movement: 'minecraft:movement',
	underwaterMovement: 'minecraft:underwater_movement',
};


//#region SERVICE

/**
 * Centralized attribute applier and the single abstraction layer over player
 * attributes. Numeric stats (movement, underwater movement) are adjusted via
 * {@link EntityAttributeComponent}; max health is driven through the BP
 * `health.N` events while the definitive value is cached in {@link PlayerState};
 * everything else is applied through the smallest possible set of
 * `Entity.triggerEvent` calls with per-player diffing.
 */
export class AttributeService {
	private static readonly log = Log.get('AttributeService');
	private static readonly applied = new Map<string, AttributeOverrides>();


	//#region APPLY

	/** Applies the given attributes. Only acts on keys that changed. */
	static apply(player: Player, attrs: AttributeOverrides): void {
		const last = this.applied.get(player.id) ?? {};
		const next: AttributeOverrides = { ...last };

		for (const key of Object.keys(attrs) as AttributeKey[]) {
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


	//#region NUMERIC ATTRIBUTES

	/** Sets the player's base walking speed, clamped to the component bounds. */
	static setMovement(player: Player, value: number): void {
		this.setComponentValue(player, 'minecraft:movement', value);
	}

	/** Sets the player's base underwater speed, clamped to the component bounds. */
	static setUnderwaterMovement(player: Player, value: number): void {
		this.setComponentValue(player, 'minecraft:underwater_movement', value);
	}

	/**
	 * Sets the current value of an attribute component, clamped to the
	 * component's effective lower/upper bound (as defined in the BP entity).
	 */
	static setComponentValue(player: Player, componentId: string, value: number): void {
		const comp = player.getComponent(componentId) as EntityAttributeComponent | undefined;
		if (!comp) {
			this.log.warn(`'${componentId}' component missing on ${player.name}`);
			return;
		}
		const clamped = Math.min(Math.max(value, comp.effectiveMin), comp.effectiveMax);
		try {
			comp.setCurrentValue(clamped);
		} catch (e: any) {
			this.log.error(`setCurrentValue('${componentId}', ${clamped}) failed: ${e?.stack ?? e}`);
		}
	}


	//#region MAX HEALTH

	/**
	 * Sets the player's definitive max health. Drives the BP `health.N` events
	 * (the engine cannot raise an attribute's max from script) and caches the
	 * value in {@link PlayerState} for the Diviner abilities to read back.
	 */
	static setMaxHealth(player: Player, value: number): void {
		const clamped = Math.min(Math.max(Math.round(value), MIN_MAX_HEALTH), MAX_MAX_HEALTH);
		try {
			player.triggerEvent(`${NS}:health.${clamped}`);
		} catch (e: any) {
			this.log.error(`triggerEvent '${NS}:health.${clamped}' failed: ${e?.stack ?? e}`);
		}
		PlayerState.for(player).setFlag(DEFINITIVE_MAX_HEALTH_FLAG, clamped);
	}

	/** Returns the player's tracked definitive max health, falling back to the live component. */
	static getDefinitiveMaxHealth(player: Player): number {
		const tracked = PlayerState.for(player).getFlag<number>(DEFINITIVE_MAX_HEALTH_FLAG);
		if (tracked !== undefined) return tracked;
		const comp = player.getComponent('minecraft:health') as EntityAttributeComponent | undefined;
		return comp?.effectiveMax ?? 20;
	}


	//#region INTERNAL

	private static trigger(player: Player, key: AttributeKey, value: string): void {
		const componentId = NUMERIC_COMPONENT_IDS[key];
		if (componentId) {
			this.setComponentValue(player, componentId, Number(value));
			return;
		}
		if (key === 'health') {
			this.setMaxHealth(player, Number(value));
			return;
		}

		const eventName = `${NS}:${this.eventNameFor(key)}.${value}`;
		try {
			player.triggerEvent(eventName);
		} catch (e: any) {
			this.log.error(`triggerEvent '${eventName}' failed: ${e?.stack ?? e}`);
		}
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
