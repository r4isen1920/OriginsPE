import {
	Player,
	EntityComponentTypes,
	EquipmentSlot,
	ItemStack,
	ItemLockMode,
	ItemComponentTypes
} from '@minecraft/server';
import { RegisterPower } from '../Registries';
import { Power } from '../Ability';

/**
 * Winged is a passive power that grants the holder a custom Elytra item when equipped.
 * Loose: dispatched to whoever is granted the power, with no origin coupling.
 */

@RegisterPower
export class Winged implements Power {
	readonly id = 'elytra';
	readonly tickInterval = 100;
	private static readonly ELYTRA_LORE = '§r§6Elytrian§r';

	onAcquire(player: Player): void {
		this.ensureElytra(player);
	}

	onRelease(player: Player): void {
		const equippableComp = player.getComponent(EntityComponentTypes.Equippable);
		if (!equippableComp) return;

		const chestItem = equippableComp.getEquipment(EquipmentSlot.Chest);
		const isCustomElytra =
			chestItem &&
			chestItem.typeId === 'minecraft:elytra' &&
			chestItem.getLore()?.includes(Winged.ELYTRA_LORE);

		if (isCustomElytra) {
			equippableComp.setEquipment(EquipmentSlot.Chest, undefined);
		}
	}

	onTick(player: Player): void {
		this.ensureElytra(player);
	}

	private ensureElytra(player: Player): void {
		const equippableComp = player.getComponent(EntityComponentTypes.Equippable);
		if (!equippableComp) return;

		const chestItem = equippableComp.getEquipment(EquipmentSlot.Chest);
		const isCustomElytra =
			chestItem &&
			chestItem.typeId === 'minecraft:elytra' &&
			chestItem.getLore()?.includes(Winged.ELYTRA_LORE);

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
	}
}
