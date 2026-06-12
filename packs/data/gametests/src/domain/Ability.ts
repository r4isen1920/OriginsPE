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


/** Optional model/skin/emitter overrides applied via data-driven entity events. */
export interface OriginEffects {
	model?: string;
	skin?: string;
	emitter?: string;
}


/**
 * Marks an {@link Ability} as an active (player-triggered) skill that appears in
 * the ability wheel. Abilities that declare this -- and implement
 * {@link Ability.onActivate} -- become selectable entries in the wheel.
 */
export interface ActiveAbility {
	/**
	 * Two-character icon id from the `textures/origins/hud/cooldown/` atlas used
	 * to render the wheel slot (e.g. "24").
	 */
	readonly icon: string;
	/** Localization key for the ability's display name shown in the wheel. */
	readonly name: string;
	/**
	 * Cooldown key consulted when prioritizing wheel slots. Abilities that are
	 * not on cooldown are listed first. Defaults to the ability {@link Ability.id}.
	 */
	readonly cooldownKey?: string;
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

	/** Optional display name used in the UI. Falls back to the id if not set. */
	readonly displayName?: string;

	/**
	 * Two-character icon id from the `textures/origins/hud/cooldown/` atlas shown
	 * beside this trait in the powers list (e.g. "01"). Omit for traits with no icon.
	 */
	readonly icon?: string;

	/** If set, the player tick loop calls {@link onTick} every N ticks. */
	readonly tickInterval?: number;

	/**
	 * Attribute overrides layered on top of the default attribute profile when
	 * this ability is active. Damage overrides can live here too and are merged
	 * from every active ability in registration order; later entries win for
	 * conflicting stat keys.
	 */
	readonly attributes?: AttributeOverrides;

	/**
	 * When specified, this ability is an active (player-triggered) skill: it is
	 * listed in the player's ability wheel and {@link onActivate} is invoked when
	 * the player confirms it from the wheel.
	 */
	readonly active?: ActiveAbility;

	/** Called once when the ability is granted to the player. */
	onAcquire?(player: Player): void;
	/** Called once when the ability is revoked from the player. */
	onRelease?(player: Player): void;

	/**
	 * Called when the player confirms this ability from the ability wheel. Only
	 * meaningful for abilities that also declare {@link active}.
	 */
	onActivate?(player: Player): void;

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


/** A power granted by the player's chosen origin. Use `implements Power`. */
export interface Power extends Ability {}

/** A perk granted by the player's chosen class. Use `implements Perk`. */
export interface Perk extends Ability {}


/** Difficulty tier shown by the picker UI for an origin. */
export enum OriginDifficulty {
	Human = 'human',
	Easy = 'easy',
	Medium = 'medium',
	Hard = 'hard',
}

/** Difficulty tier shown by the picker UI for a class. */
export enum ClassDifficulty {
	Nitwit = 'nitwit',
	Decent = 'decent',
	Very = 'very',
}


/** A selectable origin (race) granting a fixed list of powers. Use `implements Origin`. */
export interface Origin {
	readonly id: string;
	/** Otherwise known as the **impact** of this Origin to the gameplay. */
	readonly difficulty: OriginDifficulty;
	/** Power ids (lang-token spelling, e.g. "webbing"). Order drives the powers UI. */
	readonly powers: readonly string[];
	/** Optional control bindings. */
	readonly controls?: readonly string[];
	/** Optional render overrides applied via data-driven events. */
	readonly effects?: OriginEffects;
}


/** A selectable class granting a fixed list of perks. Use `implements CharacterClass`. */
export interface CharacterClass {
	readonly id: string;
	/** Otherwise known as how **game-changing** this Class is to the gameplay. */
	readonly difficulty: ClassDifficulty;
	/** Perk ids (lang-token spelling). Order drives the powers UI. */
	readonly perks: readonly string[];
	/** Optional control bindings. */
	readonly controls?: readonly string[];
}
