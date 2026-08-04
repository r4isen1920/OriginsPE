import {
	BlockContainerClosedAfterEvent,
	BlockContainerOpenedAfterEvent,
	EntityComponentTypes,
	ItemComponentTypes,
	ItemStack,
	Player,
	PlayerInventoryItemChangeAfterEvent,
	PlayerLeaveAfterEvent,
	system,
} from '@minecraft/server';
import { MinecraftBlockTypes, MinecraftPotionDeliveryTypes } from '@minecraft/vanilla-data';

import {
	AfterBlockContainerClosed,
	AfterBlockContainerOpened,
	AfterPlayerInventoryItemChange,
	AfterPlayerLeave,
} from '../../../core/platform/DecoratedEvents';
import { PlayerState } from '../../../core/platform/PlayerState';
import { Log } from '../../../utils';

import ClericPotionUtils, { ClericPotionRef } from './ClericPotionUtils';



/**
 * This class is part of the Cleric's perk system.
 * 
 * This in particular intercepts the vanilla brewing process to apply Cleric-specific logic.
 */
export default class ClericPotionInventory {
	private static readonly log = Log.get('ClericPotionInventory');

	/** Ids of players currently looking at a brewing stand. */
	private static readonly brewing = new Set<string>();

	private static readonly deliveryFor: Readonly<Record<string, string>> = {
		[MinecraftPotionDeliveryTypes.Consume]: 'potion',
		[MinecraftPotionDeliveryTypes.ThrownSplash]: 'splash_potion',
		[MinecraftPotionDeliveryTypes.ThrownLingering]: 'lingering_potion',
	};


	//#region Session

	@AfterBlockContainerOpened({ blockFilter: { includeTypes: [MinecraftBlockTypes.BrewingStand] } })
	static onContainerOpened(ev: BlockContainerOpenedAfterEvent): void {
		const player = ev.openSource.entity;
		if (!(player instanceof Player)) return;

		this.brewing.add(player.id);
		this.log.debug(`Brewing session opened: ${player.name}`);
	}

	@AfterBlockContainerClosed({ blockFilter: { includeTypes: [MinecraftBlockTypes.BrewingStand] } })
	static onContainerClosed(ev: BlockContainerClosedAfterEvent): void {
		const player = ev.closeSource.entity;
		if (!(player instanceof Player)) return;

		this.brewing.delete(player.id);
		this.log.debug(`Brewing session closed: ${player.name}`);
	}

	@AfterPlayerLeave
	static onPlayerLeave(ev: PlayerLeaveAfterEvent): void {
		this.brewing.delete(ev.playerId);
	}


	//#region Conversion

	@AfterPlayerInventoryItemChange
	static onInventoryItemChange(ev: PlayerInventoryItemChangeAfterEvent): void {
		const { player, itemStack, slot } = ev;
		if (!itemStack || !this.brewing.has(player.id)) return;

		// Guard against the write-back below re-entering this handler. The
		// replacement is a custom item and never carries a potion component,
		// but stating it outright keeps the loop provably finite.
		if (ClericPotionUtils.resolveItem(itemStack.typeId)) return;

		const ref = this.referenceFor(itemStack);
		if (!ref) return;

		if (!PlayerState.for(player).hasPerk(ClericPotionUtils.bonusFor(ref.tier.tier))) return;

		const enhanced = this.build(ref, itemStack);
		if (!enhanced) return;

		// Mutating the inventory from inside its own change event is unsafe,
		// so defer the write by a tick.
		system.run(() => {
			const container = player.getComponent(EntityComponentTypes.Inventory)?.container;
			if (!container) return;

			const current = container.getItem(slot);
			if (current?.typeId !== itemStack.typeId) return;

			container.setItem(slot, enhanced);
			this.log.info(`Brew enhanced: ${itemStack.typeId} -> ${enhanced.typeId} for ${player.name}`);
		});
	}

	/** Resolves a vanilla potion item to its Cleric counterpart, if one exists. */
	private static referenceFor(itemStack: ItemStack): ClericPotionRef | undefined {
		const potion = itemStack.getComponent(ItemComponentTypes.Potion);
		if (!potion) return undefined;

		const delivery = this.deliveryFor[potion.potionDeliveryType.id];
		if (!delivery) return undefined;

		return ClericPotionUtils.resolveVanilla(potion.potionEffectType.id, delivery);
	}

	/** Builds the enhanced stack, carrying over the flags worth preserving. */
	private static build(ref: ClericPotionRef, source: ItemStack): ItemStack | undefined {
		try {
			const enhanced = new ItemStack(ClericPotionUtils.itemIdFor(ref.potion, ref.tier, ref.delivery), 1);

			enhanced.keepOnDeath = source.keepOnDeath;
			enhanced.lockMode = source.lockMode;

			ClericPotionUtils.decorate(enhanced, ref);
			return enhanced;
		} catch (e: any) {
			this.log.error(`Failed to build enhanced potion for '${ref.tier.potion}': `, e);
			return undefined;
		}
	}
}
