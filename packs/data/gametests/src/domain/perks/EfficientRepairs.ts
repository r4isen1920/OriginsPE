import { EntityComponentTypes, Player } from '@minecraft/server';

import { Perk } from '../../core/abilities/Ability';
import { RegisterPerk } from '../../core/abilities/Registries';
import { EntityUtils, Log } from '../../utils';
import { ItemBonuses } from '../../core/platform/ItemBonuses';



@RegisterPerk
export class EfficientRepairs implements Perk {
	private static readonly log = Log.get('EfficientRepairs');

	readonly id = 'efficient_repairs';
	readonly tickInterval = 2;


	/** Item tag carried by every forged counterpart produced by the Blacksmith item templates. */
	private static readonly FORGED_TAG = 'r4isen1920_originspe:blacksmith_forged';


	//#region Apply

	onTick(player: Player): void {
		const container = EntityUtils.getComponent(player, EntityComponentTypes.Inventory)?.container;
		if (!container) return;

		const inventory = EntityUtils.getInventory(player);
		if (!inventory) return;

		for (const [slot, item] of inventory) {
			if (!item.hasTag(EfficientRepairs.FORGED_TAG)) continue;

			const newItem = ItemBonuses.mark(item, 'efficient_repairs');
			if (!newItem) continue;

			container.setItem(slot, newItem);
			EfficientRepairs.log.info(`Item marked: ${item.typeId} in slot ${slot} for player ${player.name}`);
		}
	}
}
