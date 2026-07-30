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
	EntityDieAfterEvent,
} from '@minecraft/server';

import type { AttributeOverrides, EmitterType, ModelType, OutlineType, SkinType } from '../../services';



/** Optional visual effects applied to this Origin. */
export interface OriginEffects {
	/** Changes to the geometry */
	model?: ModelType;
	/** Changes to the skin */
	skin?: SkinType;
	/** Particle effect added */
	emitter?: EmitterType;
	/** Outline or aura effect added */
	outline?: OutlineType;
}


/**
 * Represents how this ability can be actively triggered from the ability wheel.
 */
export interface ActiveAbility {
	/**
	 * Two-character icon id from the `textures/origins/hud/cooldown/`
	 * atlas used to render for the wheel slot (e.g. "23").
	 */
	readonly icon: string;
	/** Localization key for the ability's display name shown in the wheel. */
	readonly name: string;
}


//#region ABILITY
/**
 * Describes a trait granted by an {@link Origin} or {@link CharacterClass}.
 * Common shape for both {@link Power} and {@link Perk}, respectively.
 */
export interface Ability {
	/** Unique identifier for this ability. */
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
	 * Attributes to override for the player while this ability is active.
	 * You can use these to actively modify the player's stats, such as movement speed, health, or attack damage.
	 * Note that these overrides are applied on top of the player's base attributes and any other active abilities.
	 */
	readonly attributes?: AttributeOverrides;

	/**
	 * When specified, this ability can be actively triggered from the ability wheel.
	 * You can then use the {@link onActivate} event handler when the player confirms this ability from the ability wheel.
	 */
	readonly active?: ActiveAbility;

	/** Called once when the ability is granted to the player. */
	onAcquire?(player: Player): void;
	/** Called once when the ability is revoked from the player. */
	onRelease?(player: Player): void;

	/**
	 * Called when the player confirms this ability from the ability wheel.
	 * Only meaningful for abilities that also declare {@link active}.
	 */
	onActivate?(player: Player): void;

	/** Per-player tick callback. Only invoked when {@link tickInterval} is set. */
	onTick?(player: Player): void;
	/** Called when the owner is hurt. */
	onHurt?(player: Player, ev: EntityHurtAfterEvent): void;
	/**
	 * Called when the owner deals damage to another entity.
	 * Unlike {@link onAttack}, this event includes the damage dealt.
	 */
	onDealDamage?(player: Player, ev: EntityHurtAfterEvent): void;
	/** Called before the owner's incoming damage is applied. */
	onHurtBefore?(player: Player, ev: EntityHurtBeforeEvent): void;
	/** Called when the owner attacks an entity. */
	onAttack?(player: Player, ev: EntityHitEntityAfterEvent): void;
	/** Called when the owner's projectile hits. */
	onProjectileHit?(player: Player, ev: ProjectileHitEntityAfterEvent): void;
	/** Called when the owner uses any item. */
	onItemUse?(player: Player, ev: ItemUseAfterEvent): void;
	/** Called before the owner uses any item. */
	onBeforeItemUse?(player: Player, ev: ItemUseBeforeEvent): void;
	/** Called when the owner finishes consuming a food or potion item. */
	onItemCompleteUse?(player: Player, ev: ItemCompleteUseAfterEvent): void;
	/** Called when the owner's health changes. */
	onHealthChange?(player: Player, ev: EntityHealthChangedAfterEvent): void;
	/** Called when an effect is added to the owner. */
	onEffectAdd?(player: Player, ev: EffectAddAfterEvent): void;
	/** Called when the owner changes dimension. */
	onDimensionChange?(player: Player, ev: PlayerDimensionChangeAfterEvent): void;
	/** Called when the owner breaks a block. */
	onBreakBlock?(player: Player, ev: PlayerBreakBlockAfterEvent): void;
	/** Called when the owner places a block. */
	onPlaceBlock?(player: Player, ev: PlayerPlaceBlockAfterEvent): void;
	/** Called when the player dies. */
	onDeath?(player: Player, ev: EntityDieAfterEvent): void;
}


/** Represents a trait granted by the player's chosen {@link Origin}. */
export interface Power extends Ability {}

/** Represents a trait granted by the player's chosen {@link CharacterClass}. */
export interface Perk extends Ability {}


/** Difficulty tier shown by the picker UI for an origin. */
export enum OriginDifficulty {
	/**
	 * This Origin does not impact gameplay.
	 */
	Human = 'human',
	/**
	 * This Origin has a minor impact on gameplay.
	 */
	Easy = 'easy',
	/**
	 * This Origin has a moderate impact on gameplay.
	 */
	Medium = 'medium',
	/**
	 * This Origin has a significant impact on gameplay.
	 */
	Hard = 'hard',
}

/** Difficulty tier shown by the picker UI for a class. */
export enum ClassDifficulty {
	/**
	 * This Class does not grant additional perks.
	 */
	Nitwit = 'nitwit',
	/**
	 * This Class grants a minor set of perks.
	 */
	Niche = 'niche',
	/**
	 * This Class grants a moderate set of perks.
	 */
	Decent = 'decent',
	/**
	 * This Class grants a significant set of perks.
	 */
	Very = 'very',
}


/** A selectable Origin (race) granting a fixed list of powers. */
export interface Origin {
	/** Unique identifier for this Origin. */
	readonly id: string;
	/** Otherwise known as the **impact** of this Origin to the gameplay. */
	readonly difficulty: OriginDifficulty;
	/** Identifiers that correspond to the powers granted by this Origin. */
	readonly powers: readonly string[];
	/** Optional effects applied to the player. These are purely cosmetic and visual. */
	readonly effects?: OriginEffects;
}


/** A selectable class granting a fixed list of perks. Use `implements CharacterClass`. */
export interface CharacterClass {
	readonly id: string;
	/** Otherwise known as how **game-changing** this Class is to the gameplay. */
	readonly difficulty: ClassDifficulty;
	/** Identifiers that correspond to the perks granted by this Class. */
	readonly perks: readonly string[];
}
