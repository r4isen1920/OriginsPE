import { MinecraftEffectTypes, MinecraftItemTypes } from '@minecraft/vanilla-data';
import { Perk } from '../../core/abilities/Ability';
import { RegisterPerk } from '../../core/abilities/Registries';
import { EntityComponentTypes, ItemCompleteUseAfterEvent, Player, TicksPerSecond } from '@minecraft/server';
import { EntityUtils, Log } from '../../utils';
import { AfterItemCompleteUse } from '../../core';
import { ItemBonuses } from '../../core/platform/ItemBonuses';



@RegisterPerk
export class BetterStew implements Perk {
	private static readonly log = Log.get('BetterStew');

	readonly id = 'better_stew';
	readonly tickInterval = 2;


	private static readonly affectedItems: string[] = [
		MinecraftItemTypes.BeetrootSoup,
		MinecraftItemTypes.MushroomStew,
		MinecraftItemTypes.RabbitStew,
	];


	//#region Apply

	onTick(player: Player): void {
		const container = EntityUtils.getComponent(player, EntityComponentTypes.Inventory)?.container;
		if (!container) return;

		const inventory = EntityUtils.getInventory(player);
		if (!inventory) return;

		for (const [slot, item] of inventory) {
			if (!BetterStew.affectedItems.includes(item.typeId)) continue;

			const newItem = ItemBonuses.mark(item, 'better_stew');
			if (!newItem) continue;

			container.setItem(slot, newItem);
			BetterStew.log.info(`Item marked: ${item.typeId} in slot ${slot} for player ${player.name}`);
		}
	}


	//#region Triggers

	@AfterItemCompleteUse
	static onItemCompleteUse(event: ItemCompleteUseAfterEvent): void {
		const { itemStack, source } = event;
		if (
			!BetterStew.affectedItems.includes(itemStack.typeId) ||
			!ItemBonuses.hasBonus(itemStack, 'better_stew')
		) return;

		source.addEffect(
			MinecraftEffectTypes.Regeneration,
			TicksPerSecond * 30,
		);
		this.log.info(`Applied regen: ${source.name}, item: ${itemStack.typeId}`);
	}
}
