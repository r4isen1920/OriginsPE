import type { EntityDamageCause, EntityHurtBeforeEvent, Player } from '@minecraft/server';

//#region VALUE TYPES

/**
 * Sprint/exhaustion drain profile. Maps to the `exhaustion.*` data-driven
 * entity events on the player actor.
 */
export type ExhaustionRate =
	| 'normal'
	| 'piglin'
	| 'shulk'
	| 'explorer'
	| 'miner';

/**
 * Entity family the player reports as. Drives mob targeting/aggression and
 * maps to the `family_type.*` data-driven entity events.
 */
export type FamilyType =
	| 'player'
	| 'fish'
	| 'undead'
	| 'enderman'
	| 'cat'
	| 'camouflage';

/** Where the player can breathe. Maps to the `breathable.*` events. */
export type BreathableMode = 'land' | 'underwater';

/** Buoyancy behaviour in water. Maps to the `buoyant.*` events. */
export type BuoyancyMode = 'normal' | 'float_on_water';

/** Damage scaling rule evaluated while the player is hurt. */
export interface DamageOverride {
	/** Stable id, used for logging/de-duplication. */
	readonly id: string;
	/** Optional damage-cause filter. When set, only matches this cause. */
	readonly cause?: EntityDamageCause;
	/** Optional predicate gating the override (e.g. on granted powers). */
	when?(player: Player, ev: EntityHurtBeforeEvent): boolean;
	/** Damage multiplier (applied before {@link DamageOverride.modifier}). */
	readonly multiplier?: number;
	/** Flat damage modifier added after the multiplier. */
	readonly modifier?: number;
}


//#region PROFILE

/**
 * Strongly typed snapshot of every script-driven player attribute. Numeric
 * stats are plain numbers (no string round-trip); toggles are booleans; the
 * remaining categorical stats are documented string unions. Each key is mapped
 * to a concrete effect by {@link AttributeService}:
 *
 * - `movement` / `underwaterMovement` adjust an `EntityAttributeComponent`.
 * - `health` drives the BP `health.N` events (and the definitive-health flag).
 * - everything else triggers a single data-driven entity event.
 */
export interface PlayerAttributes {
	/** Base walking speed (component value), e.g. `0.1`. */
	movement: number;
	/** Base swimming speed (component value), e.g. `0.025`. */
	underwaterMovement: number;
	/** Definitive max health in half-hearts-doubled points, e.g. `20`. */
	health: number;
	/** Base melee attack damage suffix used by the `attack.N` events. */
	attack: number;
	/** Render/hitbox scale multiplier used by the `scale.N` events. */
	scale: number;
	/** Sprint exhaustion drain rate. */
	exhaustion: ExhaustionRate;
	/** Entity family the player presents as. */
	familyType: FamilyType;
	/** Environment the player can breathe in. */
	breathable: BreathableMode;
	/** Buoyancy behaviour in water. */
	buoyant: BuoyancyMode;
	/** Whether the player visibly shakes (fear effect). */
	isShaking: boolean;
	/** Whether the player burns in daylight (undead behaviour). */
	burnsInDaylight: boolean;
	/** Whether the player's nametag/display name is shown. */
	displayName: boolean;
	/** Damage overrides applied to the player. */
	damageOverrides?: DamageOverride[];
}

/** Any key of {@link PlayerAttributes}. */
export type AttributeKey = keyof PlayerAttributes;

/**
 * A partial set of attribute values to apply on top of the current profile.
 * Damage overrides are collected alongside the normal stat overlay.
 */
export type AttributeOverrides = Partial<PlayerAttributes>;


//#region DEFAULTS

/**
 * Baseline attribute profile applied on origin/class change. Individual powers
 * and perks layer their own {@link AttributeOverrides} on top of this.
 */
export const DEFAULT_ATTRIBUTES: Readonly<PlayerAttributes> = Object.freeze({
	movement: 0.1,
	underwaterMovement: 0.025,
	health: 20,
	attack: 1,
	scale: 1,
	exhaustion: 'normal',
	familyType: 'player',
	breathable: 'land',
	buoyant: 'normal',
	isShaking: false,
	burnsInDaylight: false,
	displayName: true,
	damageOverrides: [],
});


//#region STEPPED ATTRIBUTES

/** Inclusive integer range helper. */
function range(start: number, end: number): number[] {
	const out: number[] = [];
	for (let v = start; v <= end; v++) out.push(v);
	return out;
}

/** A numeric attribute applied through discrete, data-driven entity events. */
export interface SteppedAttribute {
	/** Event/component-group suffix in the BP (snake_case). */
	event: string;
	/** Discrete values the BP generates events for. Applied values snap to the nearest. */
	steps: readonly number[];
}

/**
 * Numeric attributes whose base value (or max) can only be changed through
 * data-driven entity events -- the Scripts API can set an attribute's *current*
 * value but not its base/min/max. Each entry's {@link SteppedAttribute.steps}
 * MUST mirror the matching `attributes.*` list in `player.se.templ`; applied
 * values that fall between steps are snapped to the nearest available step.
 */
export const STEPPED_ATTRIBUTES: Readonly<Partial<Record<AttributeKey, SteppedAttribute>>> = Object.freeze({
	movement: {
		event: 'movement',
		steps: [0.025, 0.05, 0.075, 0.1, 0.1425, 0.15, 0.2, 0.25],
	},
	underwaterMovement: {
		event: 'underwater_movement',
		steps: [0, 0.005, 0.01, 0.025, 0.05, 0.075, 0.1, 0.1425, 0.15, 0.2, 0.25],
	},
	health: {
		event: 'health',
		steps: range(1, 150),
	},
	attack: {
		event: 'attack',
		steps: range(0, 20),
	},
	scale: {
		event: 'scale',
		steps: [
			0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1.0,
			1.05, 1.1, 1.15, 1.2, 1.25, 1.3, 1.35, 1.4, 1.45, 1.5, 1.55, 1.6, 1.65, 1.7, 1.75, 1.8, 1.85, 1.9, 1.95, 2.0,
			2.05, 2.1, 2.15, 2.2, 2.25, 2.3, 2.35, 2.4, 2.45, 2.5, 2.55, 2.6, 2.65, 2.7, 2.75, 2.8, 2.85, 2.9, 2.95, 3.0,
		],
	},
});
