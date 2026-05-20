import {
	Player,
	EquipmentSlot,
	ItemStack,
	ItemLockMode,
	ItemComponentTypes
} from '@minecraft/server';
import { RegisterPower } from '../Registries';
import { Power } from '../Ability';
import { PlayerTick } from '../../core/Ticker';
import { PlayerState } from '../../core/PlayerState';
import { Log } from '../../utils/Log';

/**
 * Winged is a passive power that grants Elytrians a custom Elytra item when equipped.
 */

@RegisterPower
export class Winged implements Power {
	readonly id = 'winged';
	private static readonly log = Log.get('Winged');
	private static readonly ELYTRA_LORE = '§r§6Elytrian§r';

	@PlayerTick(100)
	static onPlayerTick(player: Player): void {
		try {
			const state = PlayerState.for(player);
			const equippableComp = player.getComponent('equippable');
			if (!equippableComp) return;

			const chestItem = equippableComp.getEquipment(EquipmentSlot.Chest);
			const isCustomElytra =
				chestItem &&
				chestItem.typeId === 'minecraft:elytra' &&
				chestItem.getLore()?.includes(Winged.ELYTRA_LORE);

			if (state.getOrigin() !== 'elytrian') {
				if (isCustomElytra) {
					equippableComp.setEquipment(EquipmentSlot.Chest, undefined);
				}
				return;
			}

			if (isCustomElytra) {
				if (!chestItem) return;
				const durability = chestItem.getComponent(ItemComponentTypes.Durability);
				if (durability && durability.damage > 0) {
					durability.damage = 0;
					equippableComp.setEquipment(EquipmentSlot.Chest, chestItem);
				}
				return;
			}

			const newElytra = new ItemStack('minecraft:elytra', 1);
			newElytra.lockMode = ItemLockMode.slot;
			newElytra.keepOnDeath = true;
			newElytra.setLore([Winged.ELYTRA_LORE]);

			const durability = newElytra.getComponent(ItemComponentTypes.Durability);
			if (durability) durability.damage = 0;

			equippableComp.setEquipment(EquipmentSlot.Chest, newElytra);
		} catch (error: any) {
			Winged.log.error(`Error inside Winged tick handler: ${error?.stack ?? error}`);
		}
	}
}
