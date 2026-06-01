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
	/** Projectile spawner override token (e.g. `'reset'`). */
	projectileSpawner: string;
	/** Whether the player visibly shakes (fear effect). */
	isShaking: boolean;
	/** Whether the player burns in daylight (undead behaviour). */
	burnsInDaylight: boolean;
	/** Whether the player's nametag/display name is shown. */
	displayName: boolean;
}

/** Any key of {@link PlayerAttributes}. */
export type AttributeKey = keyof PlayerAttributes;

/** A partial set of attribute values to apply on top of the current profile. */
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
	projectileSpawner: 'reset',
	isShaking: false,
	burnsInDaylight: false,
	displayName: true,
});
