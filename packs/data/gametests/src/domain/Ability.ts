import {
	EffectAddAfterEvent,
	EntityHealthChangedAfterEvent,
	EntityHurtAfterEvent,
	EntityHurtBeforeEvent,
	EntityHitEntityAfterEvent,
	ItemCompleteUseAfterEvent,
	ItemUseAfterEvent,
	ItemUseBeforeEvent,
	Player,
	PlayerBreakBlockAfterEvent,
	PlayerDimensionChangeAfterEvent,
	PlayerPlaceBlockAfterEvent,
	ProjectileHitEntityAfterEvent,
} from '@minecraft/server';

import type { AttributeOverrides } from '../services/Attributes';


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
	 * Attribute overrides layered on top of the default attribute profile when
	 * this ability is active. Multiple active abilities are merged in
	 * registration order; later entries win for conflicting keys.
	 */
	readonly attributes?: AttributeOverrides;

	/** Called once when the ability is granted to the player. */
	onAcquire?(player: Player): void;
	/** Called once when the ability is revoked from the player. */
	onRelease?(player: Player): void;

	/** Per-player tick callback. Only invoked when {@link tickInterval} is set. */
	onTick?(player: Player): void;
	/** Called from {@link DamageService} when the owner is hurt. */
	onHurt?(player: Player, ev: EntityHurtAfterEvent): void;
	/**
	 * Called from {@link DamageService} when the owner deals damage to another
	 * entity. Unlike {@link onAttack}, this fires from the `entityHurt` event so
	 * the applied `ev.damage` amount is available (read-only).
	 */
	onDealDamage?(player: Player, ev: EntityHurtAfterEvent): void;
	/**
	 * Called from {@link DamageService} before the owner's incoming damage is
	 * applied. Mutate `ev.damage` to rescale/cancel the hit.
	 */
	onHurtBefore?(player: Player, ev: EntityHurtBeforeEvent): void;
	/** Called from {@link DamageService} when the owner attacks an entity. */
	onAttack?(player: Player, ev: EntityHitEntityAfterEvent): void;
	/** Called from {@link DamageService} when the owner's projectile hits. */
	onProjectileHit?(player: Player, ev: ProjectileHitEntityAfterEvent): void;
	/** Called from the item-use dispatcher when the owner uses any item. */
	onItemUse?(player: Player, ev: ItemUseAfterEvent): void;
	/** Called from the item-use dispatcher before the owner uses any item. */
	onBeforeItemUse?(player: Player, ev: ItemUseBeforeEvent): void;
	/** Called when the owner finishes consuming a food/potion item. */
	onItemCompleteUse?(player: Player, ev: ItemCompleteUseAfterEvent): void;
	/** Called from {@link AbilityEventService} when the owner's health changes. */
	onHealthChange?(player: Player, ev: EntityHealthChangedAfterEvent): void;
	/** Called from {@link AbilityEventService} when an effect is added to the owner. */
	onEffectAdd?(player: Player, ev: EffectAddAfterEvent): void;
	/** Called from {@link AbilityEventService} when the owner changes dimension. */
	onDimensionChange?(player: Player, ev: PlayerDimensionChangeAfterEvent): void;
	/** Called from {@link AbilityEventService} when the owner breaks a block. */
	onBreakBlock?(player: Player, ev: PlayerBreakBlockAfterEvent): void;
	/** Called from {@link AbilityEventService} when the owner places a block. */
	onPlaceBlock?(player: Player, ev: PlayerPlaceBlockAfterEvent): void;
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
