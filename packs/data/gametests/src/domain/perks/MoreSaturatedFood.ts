import { MinecraftItemTypes } from '@minecraft/vanilla-data';
import { Perk } from '../../core/abilities/Ability';
import { RegisterPerk } from '../../core/abilities/Registries';
import { EntityComponentTypes, ItemCompleteUseAfterEvent, Player } from '@minecraft/server';
import { EntityUtils, Log } from '../../utils';
import { AfterItemCompleteUse } from '../../core';
import { ItemBonuses } from '../../core/platform/ItemBonuses';



@RegisterPerk
export class MoreSaturatedFood implements Perk {
	private static readonly log = Log.get('MoreSaturatedFood');

	readonly id = 'more_saturated_food';
	readonly tickInterval = 2;


	private static readonly affectedItems: FoodItemEntry[] = [
		{ itemTypeId: MinecraftItemTypes.BakedPotato, saturation: 6 },
		{ itemTypeId: MinecraftItemTypes.BeetrootSoup, saturation: 7.2 },
		{ itemTypeId: MinecraftItemTypes.Bread, saturation: 6 },
		{ itemTypeId: MinecraftItemTypes.CookedBeef, saturation: 12.8 },
		{ itemTypeId: MinecraftItemTypes.CookedChicken, saturation: 7.2 },
		{ itemTypeId: MinecraftItemTypes.CookedCod, saturation: 6 },
		{ itemTypeId: MinecraftItemTypes.CookedMutton, saturation: 9.6 },
		{ itemTypeId: MinecraftItemTypes.CookedPorkchop, saturation: 12.8 },
		{ itemTypeId: MinecraftItemTypes.CookedRabbit, saturation: 6 },
		{ itemTypeId: MinecraftItemTypes.CookedSalmon, saturation: 9.6 },
		{ itemTypeId: MinecraftItemTypes.DriedKelp, saturation: 0.2 },
		{ itemTypeId: MinecraftItemTypes.MushroomStew, saturation: 7.2 },
		{ itemTypeId: MinecraftItemTypes.GoldenCarrot, saturation: 14.4 },
		{ itemTypeId: MinecraftItemTypes.RabbitStew, saturation: 12 },
	];


	//#region Apply

	onTick(player: Player): void {
		const container = EntityUtils.getComponent(player, EntityComponentTypes.Inventory)?.container;
		if (!container) return;

		const inventory = EntityUtils.getInventory(player);
		if (!inventory) return;

		for (const [slot, item] of inventory) {
			if (!MoreSaturatedFood.affectedItems.some(e => e.itemTypeId === item.typeId)) continue;

			const newItem = ItemBonuses.mark(item, 'more_saturated_food');
			if (!newItem) continue;

			container.setItem(slot, newItem);
			MoreSaturatedFood.log.info(`Item marked: ${item.typeId} in slot ${slot} for player ${player.name}`);
		}
	}


	//#region Triggers

	@AfterItemCompleteUse
	static onItemCompleteUse(event: ItemCompleteUseAfterEvent): void {
		const { itemStack, source } = event;
		const entry = MoreSaturatedFood.affectedItems.find(e => e.itemTypeId === itemStack.typeId);
		if (
			!entry ||
			!ItemBonuses.hasBonus(itemStack, 'more_saturated_food')
		) return;

		const hunger = EntityUtils.getComponent(source, EntityComponentTypes.Hunger);
		if (!hunger) return;

		const curr = hunger.currentValue;
		const restoreAmount = entry.saturation * 0.25; // 25% more saturation
		hunger.setCurrentValue(
			Math.min(
				curr + restoreAmount,
				hunger.effectiveMax
			)
		);
		this.log.info(`Applied hunger: ${restoreAmount}, for ${source.name}, item: ${itemStack.typeId}, was: ${curr}, now: ${hunger.currentValue}`);
	}
}



//#region Types
type FoodItemEntry = {
	/** The type identifier of this food entry */
	itemTypeId: string;
	/** Amount of saturation that this food typically restores */
	saturation: number;
}
