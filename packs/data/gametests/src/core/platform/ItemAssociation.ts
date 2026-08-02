import { ItemStack, EntityComponentTypes, GameMode, Container, PlayerInventoryItemChangeAfterEvent } from '@minecraft/server';
import { Logger } from '@bedrock-oss/bedrock-boost';
import { AfterPlayerInventoryItemChange } from '.';
import { Log } from '../../utils';
import { EntityUtils } from '../../utils/EntityUtils';

import item_association from '../../../../jsonte/item_association.json';



//#region ItemAssociation
/**
 * Handles item associations, replacing items in player inventories based on mapping.
 */
export default class ItemAssociation {
	private static readonly log = Log.get('ItemAssociation');

	/** The mapping of item IDs to their associated replacement item IDs. Adjust `associated_item.json` to modify the mappings data. */
	private static data: Record<string, string> = item_association;
	/** Internal flag to track items that should be ignored due to warnings. This is to avoid such items from being repeatedly being processed. */
	private static ignoredItemsDueToWarnings: string[] = [];


	//#region Handler
	@AfterPlayerInventoryItemChange({ includeItems: Object.keys(item_association) })
	private static __onItemChange(event: PlayerInventoryItemChangeAfterEvent) {
		const { player, itemStack, slot } = event;
		if (!itemStack) return;

		const from = itemStack.typeId;
		const target = this.data[from];
		if (!target) return;

		if (this.ignoredItemsDueToWarnings.includes(from)) return;

		const container = EntityUtils.getComponent(player, EntityComponentTypes.Inventory)?.container;
		if (!container) return;

		try {
			if (player.getGameMode() === GameMode.Creative) {
				const targetSlot = this.getItemSlot(container, target);
				if (targetSlot !== undefined) {
					player.selectedSlotIndex = targetSlot; // move to this hotbar slot
					container.setItem(slot, event.beforeItemStack);
				} else {
					container.setItem(slot, new ItemStack(target));
				}
			} else {
				const targetSlot = this.getItemSlot(container, target);
				const existing = targetSlot !== undefined ? container.getItem(targetSlot) : undefined;

				if (targetSlot === undefined || !existing || existing.amount === existing.maxAmount) {
					container.setItem(slot, new ItemStack(target));
				} else {
					// Stack onto the existing associated item and clear the source slot.
					container.setItem(targetSlot, new ItemStack(target, existing.amount + 1));
					container.setItem(slot);
				}
			}
			this.log.info(`Replaced: ${from}, with: ${target}, slot: ${slot}, for: ${player.name}`);
		} catch (e) {
			this.log.warn(`Failed: ${from}, with: ${target}, slot: ${slot}, for: ${player.name}`);
			this.log.error(e);
			this.ignoredItemsDueToWarnings.push(from);
		}
	}

	/** Returns the hotbar slot index holding the given item id, or undefined if none. */
	private static getItemSlot(container: Container, id: string): number | undefined {
		for (let i = 0; i < 9; i++) {
			const item = container.getItem(i);
			if (item?.typeId === id) return i;
		}
		return undefined;
	}

}
