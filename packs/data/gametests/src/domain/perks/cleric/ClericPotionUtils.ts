import { Entity, EntityComponentTypes, ItemStack, Player, RawMessage, RGB, TicksPerSecond } from '@minecraft/server';
import { MinecraftItemTypes } from '@minecraft/vanilla-data';

import { ItemBonuses } from '../../../core/platform/ItemBonuses';
import { Log } from '../../../utils';

import cleric_potions from '../../../../../jsonte/cleric_potions.json';



/**
 * This class is part of the Cleric's perk system.
 * 
 * This in particular allows other classes to resolve and apply the Cleric's potions.
 */
export default class ClericPotionUtils {
	private static readonly log = Log.get('ClericPotionUtils');


	//#region Tuning

	/** Duration bonus granted by Longer Potions, applied to every `long` brew. */
	private static readonly LONGER_MULTIPLIER = 4 / 3;

	/** Amplifier bonus granted by Powerful Potions, applied to every `potent` brew. */
	private static readonly POWERFUL_BONUS = 1;

	private static readonly ITEM_PREFIX = 'r4isen1920_originspe:cleric_';

	/** Lore colours matching vanilla: anything detrimental reads red, the rest grey or blue. */
	private static readonly RESET = '§r';
	private static readonly BENEFICIAL_COLOR = '§7';
	private static readonly HARMFUL_COLOR = '§c';
	private static readonly APPLIED_COLOR = '§5';
	private static readonly MODIFIER_COLOR = '§9';
	private static readonly PADDING = '§r ';

	/**
	 * Attribute modifiers vanilla lists under "When Applied:", keyed by effect
	 * and resolved per level. Effects absent here contribute no modifier line.
	 */
	private static readonly EFFECT_MODIFIER: Readonly<Record<string, (level: number) => AttributeModifier>> = {
		'minecraft:speed': level => ({ attribute: 'minecraft:movement', amount: 20 * level, percent: true }),
		'minecraft:slowness': level => ({ attribute: 'minecraft:movement', amount: -15 * level, percent: true }),
		'minecraft:strength': level => ({ attribute: 'minecraft:attack_damage', amount: ClericPotionUtils.attackDelta(1.3, 0.3, level), percent: false }),
		'minecraft:weakness': level => ({ attribute: 'minecraft:attack_damage', amount: ClericPotionUtils.attackDelta(0.8, 0.4, level), percent: false }),
	};

	/**
	 * Display name suffix and disposition per effect. Vanilla keys these off its
	 * own legacy names, which do not match the modern effect ids, so the mapping
	 * has to be stated rather than derived.
	 */
	private static readonly EFFECT_DISPLAY: Readonly<Record<string, { readonly lang: string; readonly harmful: boolean }>> = {
		'minecraft:speed': { lang: 'moveSpeed', harmful: false },
		'minecraft:slowness': { lang: 'moveSlowdown', harmful: true },
		'minecraft:strength': { lang: 'damageBoost', harmful: false },
		'minecraft:instant_health': { lang: 'heal', harmful: false },
		'minecraft:instant_damage': { lang: 'harm', harmful: true },
		'minecraft:jump_boost': { lang: 'jump', harmful: false },
		'minecraft:regeneration': { lang: 'regeneration', harmful: false },
		'minecraft:fire_resistance': { lang: 'fireResistance', harmful: false },
		'minecraft:water_breathing': { lang: 'waterBreathing', harmful: false },
		'minecraft:invisibility': { lang: 'invisibility', harmful: false },
		'minecraft:night_vision': { lang: 'nightVision', harmful: false },
		'minecraft:weakness': { lang: 'weakness', harmful: true },
		'minecraft:poison': { lang: 'poison', harmful: true },
		'minecraft:resistance': { lang: 'resistance', harmful: false },
		'minecraft:slow_falling': { lang: 'slowFalling', harmful: false },
	};


	//#region Table

	static readonly potions = cleric_potions.cleric_potions as readonly ClericPotion[];
	static readonly deliveries = cleric_potions.cleric_potion_deliveries as readonly ClericDelivery[];
	static readonly cloud = cleric_potions.cleric_potion_cloud;

	/** Vanilla `potionEffectType.id` -> the Cleric counterpart, per delivery. */
	private static readonly byVanillaPotion = new Map<string, { potion: ClericPotion; tier: ClericPotionTier; index: number }>();

	/** Cleric item type id -> full reference. */
	private static readonly byItemId = new Map<string, ClericPotionRef>();

	private static readonly indexed = ClericPotionUtils.buildIndex();

	private static buildIndex(): boolean {
		this.potions.forEach((potion, index) => {
			for (const tier of potion.tiers) {
				this.byVanillaPotion.set(tier.potion, { potion, tier, index });

				for (const delivery of this.deliveries) {
					this.byItemId.set(this.itemIdFor(potion, tier, delivery), { potion, tier, delivery, index });
				}
			}
		});
		this.log.debug(`Indexed ${this.byVanillaPotion.size} brews across ${this.byItemId.size} items`);
		return true;
	}

	/** Builds the generated item id for a combination. Must match `cleric_potions.i.templ`. */
	static itemIdFor(potion: ClericPotion, tier: ClericPotionTier, delivery: ClericDelivery): string {
		return `${this.ITEM_PREFIX}${delivery.id}_${tier.tier}_${potion.id}`;
	}


	//#region Lookup

	/** Resolves a Cleric potion item by its type id, or `undefined` if it is not one. */
	static resolveItem(typeId: string): ClericPotionRef | undefined {
		return this.byItemId.get(typeId);
	}

	/**
	 * Finds the Cleric counterpart of a vanilla potion the player just brewed.
	 * Only the 22 combinations vanilla can actually produce are present.
	 */
	static resolveVanilla(potionEffectTypeId: string, deliveryId: string): ClericPotionRef | undefined {
		const match = this.byVanillaPotion.get(potionEffectTypeId);
		if (!match) return undefined;

		const delivery = this.deliveries.find(d => d.id === deliveryId);
		if (!delivery) return undefined;

		return { potion: match.potion, tier: match.tier, delivery, index: match.index };
	}

	/** Parses the stored hex tint into the RGB triple the particle tinting expects. */
	static colorOf(potion: ClericPotion): RGB {
		const hex = potion.color.replace('#', '');
		return {
			red: parseInt(hex.slice(0, 2), 16) / 255,
			green: parseInt(hex.slice(2, 4), 16) / 255,
			blue: parseInt(hex.slice(4, 6), 16) / 255,
		};
	}

	/**
	 * Rebuilds a reference from the parts that survive on an entity.
	 * Used by the lingering cloud, which persists its identity as dynamic
	 * properties so it keeps working across a world reload.
	 */
	static refFor(index: number, tier: ClericTier, deliveryId: string): ClericPotionRef | undefined {
		const potion = this.potions[index];
		if (!potion) return undefined;

		const tierData = potion.tiers.find(t => t.tier === tier);
		const delivery = this.deliveries.find(d => d.id === deliveryId);
		if (!tierData || !delivery) return undefined;

		return { potion, tier: tierData, delivery, index };
	}


	//#region Derivation

	/**
	 * Derives the enhanced effects for a brew.
	 *
	 * Duration scales with the delivery factor and, for `long` brews, the Longer
	 * Potions multiplier. Amplifier gains a flat step for `potent` brews. Instant
	 * effects keep a one tick duration because they resolve immediately anyway.
	 */
	static effectsFor(ref: ClericPotionRef): readonly DerivedEffect[] {
		const { tier, delivery } = ref;

		const durationScale = delivery.factor * (tier.tier === 'long' ? this.LONGER_MULTIPLIER : 1);
		const amplifierBonus = tier.tier === 'potent' ? this.POWERFUL_BONUS : 0;

		return tier.effects.map(effect => {
			const display = this.EFFECT_DISPLAY[effect.effect];

			return {
				effect: effect.effect,
				lang: display?.lang ?? effect.effect,
				harmful: display?.harmful ?? false,
				instant: effect.duration === 0,
				duration: effect.duration === 0 ? 1 : Math.max(1, Math.round(effect.duration * durationScale)),
				amplifier: effect.amplifier + amplifierBonus,
			};
		});
	}


	//#region Description

	/** Perk that grants a tier's bonus, and the lore entry stamped on its brews. */
	static bonusFor(tier: ClericTier): string {
		return tier === 'long' ? 'longer_potions' : 'powerful_potions';
	}

	/**
	 * Writes the vanilla-style tooltip onto an enhanced potion.
	 *
	 * Custom items get none of vanilla's potion tooltip for free, so the effect
	 * summary has to be authored as lore. Translation keys are reused rather
	 * than English strings so the tooltip still localises.
	 */
	static decorate(item: ItemStack, ref: ClericPotionRef): void {
		try {
			item.setLore(this.describe(ref));
			ItemBonuses.write(item, [this.bonusFor(ref.tier.tier)]);
		} catch (e: any) {
			this.log.error(`Failed to describe ${item.typeId}: `, e);
		}
	}

	/** One line per effect: name, potency numeral when above the first, then duration. */
	private static describe(ref: ClericPotionRef): RawMessage[] {
		const effects = this.effectsFor(ref);

		const lines = effects.map<RawMessage>(effect => {
			const color = effect.harmful ? this.HARMFUL_COLOR : this.BENEFICIAL_COLOR;
			const line: RawMessage[] = [
				{ text: `${this.RESET}${color}` },
				{ translate: `potion.${effect.lang}` },
			];

			if (effect.amplifier > 0) line.push({ text: ' ' }, { translate: `potion.potency.${effect.amplifier}` });
			if (!effect.instant) line.push({ text: ` (${this.formatDuration(effect.duration)})` });

			return { rawtext: line };
		});

		const modifiers = this.modifiersFor(effects);
		if (modifiers.length === 0) return lines;

		return [
			...lines,
			{ text: this.PADDING },
			{ rawtext: [{ text: `${this.RESET}${this.APPLIED_COLOR}` }, { translate: 'potion.effects.whenDrank' }] },
			...modifiers,
		];
	}

	/** The "When Applied:" entries, one per effect that moves an attribute. */
	private static modifiersFor(effects: readonly DerivedEffect[]): RawMessage[] {
		const lines: RawMessage[] = [];

		for (const effect of effects) {
			const modifier = this.EFFECT_MODIFIER[effect.effect]?.(effect.amplifier + 1);
			if (!modifier) continue;

			const negative = modifier.amount < 0;
			const color = negative ? this.HARMFUL_COLOR : this.MODIFIER_COLOR;
			const value = Number(Math.abs(modifier.amount).toFixed(2));

			lines.push({
				rawtext: [
					{ text: `${this.RESET}${color}${negative ? '-' : '+'}${value}${modifier.percent ? '%' : ''} ` },
					{ translate: `attribute.name.${modifier.attribute}` },
				],
			});
		}

		return lines;
	}

	/**
	 * Bedrock scales attack damage as `base * factor^level + (factor^level - 1) / step`.
	 * Vanilla's tooltip is that curve against a base of 1, less the base itself.
	 */
	private static attackDelta(factor: number, step: number, level: number): number {
		const scaled = Math.pow(factor, level);
		return scaled + (scaled - 1) / step - 1;
	}

	private static formatDuration(ticks: number): string {
		const seconds = Math.round(ticks / TicksPerSecond);
		return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
	}


	//#region Application

	/** Applies a brew's derived effects to a single entity, isolating per-effect failures. */
	static applyTo(entity: Entity, ref: ClericPotionRef): void {
		for (const { effect, duration, amplifier } of this.effectsFor(ref)) {
			try {
				entity.addEffect(effect, duration, { amplifier, showParticles: true });
			} catch (e: any) {
				this.log.error(`Failed to apply '${effect}' to ${entity.typeId}: `, e);
			}
		}
	}
}



//#region TYPES

/** A single effect application described in vanilla base terms. */
export interface ClericPotionEffect {
	readonly effect: string;
	/** Vanilla base duration in ticks. Zero for instant effects. */
	readonly duration: number;
	readonly amplifier: number;
}

/** One brewable strength of a potion. `potion` is the vanilla `potionEffectType.id`. */
export interface ClericPotionTier {
	readonly tier: ClericTier;
	readonly potion: string;
	readonly effects: readonly ClericPotionEffect[];
}

export interface ClericPotion {
	readonly id: string;
	readonly texture: string;
	readonly lang: string;
	readonly color: string;
	readonly tiers: readonly ClericPotionTier[];
}

export interface ClericDelivery {
	readonly id: string;
	readonly lang: string;
	readonly texture: string;
	readonly factor: number;
	readonly throwable: boolean;
	readonly entity: string | null;
}

export type ClericTier = 'long' | 'potent';

/** A base effect after the delivery factor and perk bonuses have been applied. */
export interface DerivedEffect {
	readonly effect: string;
	/** Suffix of the vanilla `potion.<key>` display name. */
	readonly lang: string;
	readonly harmful: boolean;
	/** Instant effects show no duration, matching vanilla. */
	readonly instant: boolean;
	readonly duration: number;
	readonly amplifier: number;
}

/** A single "When Applied:" entry. */
interface AttributeModifier {
	readonly attribute: string;
	readonly amount: number;
	readonly percent: boolean;
}

/** Everything needed to act on a Cleric potion item, resolved from its type id. */
export interface ClericPotionRef {
	readonly potion: ClericPotion;
	readonly tier: ClericPotionTier;
	readonly delivery: ClericDelivery;
	/** Stable index into the potion table, mirrored into the projectile's actor property. */
	readonly index: number;
}

