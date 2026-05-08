import {
	EntityHurtAfterEvent,
	EntityHitEntityAfterEvent,
	ItemCompleteUseAfterEvent,
	ItemUseAfterEvent,
	Player,
	ProjectileHitEntityAfterEvent,
} from '@minecraft/server';

import type { DEFAULT_ATTRIBUTES } from '../services/AttributeService';


//#region SHARED TYPES

/** Optional model/skin/emitter overrides applied via data-driven entity events. */
export interface OriginEffects {
	model?: string;
	skin?: string;
	emitter?: string;
}


//#region ABILITY

/**
 * Common shape for both {@link Power} and {@link Perk}. Lists every optional
 * lifecycle hook that the centralized services will dispatch into.
 *
 * Concrete classes should declare `implements Power` (or `implements Perk`) so
 * the IDE flags missing/typo'd hooks and surfaces inherited docs.
 */
export interface Ability {
	/** Stable id (matches the legacy folder filename, e.g. "high_jump"). */
	readonly id: string;

	/** If set, the player tick loop calls {@link onTick} every N ticks. */
	readonly tickInterval?: number;

	/**
	 * Attribute overrides layered on top of {@link DEFAULT_ATTRIBUTES} when
	 * this ability is active. Multiple active abilities are merged in
	 * registration order; later entries win for conflicting keys.
	 */
	readonly attributes?: Partial<Record<keyof typeof DEFAULT_ATTRIBUTES, string>>;

	/** Called once when the ability is granted to the player. */
	onAcquire?(player: Player): void;
	/** Called once when the ability is revoked from the player. */
	onRelease?(player: Player): void;

	/** Per-player tick callback. Only invoked when {@link tickInterval} is set. */
	onTick?(player: Player): void;
	/** Called from {@link DamageService} when the owner is hurt. */
	onHurt?(player: Player, ev: EntityHurtAfterEvent): void;
	/** Called from {@link DamageService} when the owner attacks an entity. */
	onAttack?(player: Player, ev: EntityHitEntityAfterEvent): void;
	/** Called from {@link DamageService} when the owner's projectile hits. */
	onProjectileHit?(player: Player, ev: ProjectileHitEntityAfterEvent): void;
	/** Called from the item-use dispatcher when the owner uses any item. */
	onItemUse?(player: Player, ev: ItemUseAfterEvent): void;
	/** Called when the owner finishes consuming a food/potion item. */
	onItemCompleteUse?(player: Player, ev: ItemCompleteUseAfterEvent): void;
}


//#region POWER

/** A power granted by the player's chosen origin. Use `implements Power`. */
export interface Power extends Ability {}


//#region PERK

/** A perk granted by the player's chosen class. Use `implements Perk`. */
export interface Perk extends Ability {}


//#region ORIGIN

/** A selectable origin (race) granting a fixed list of powers. Use `implements Origin`. */
export interface Origin {
	readonly id: string;
	/** Power ids (must exist in `PowerRegistry`). */
	readonly powers: readonly string[];
	/** Optional control bindings. */
	readonly controls?: readonly string[];
	/** Optional render overrides applied via data-driven events. */
	readonly effects?: OriginEffects;
}


//#region CLASS

/** A selectable class granting a fixed list of perks. Use `implements CharacterClass`. */
export interface CharacterClass {
	readonly id: string;
	/** Perk ids (must exist in `PerkRegistry`). */
	readonly perks: readonly string[];
	/** Optional control bindings. */
	readonly controls?: readonly string[];
}
