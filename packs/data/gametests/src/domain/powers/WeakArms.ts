import { Player, TicksPerSecond, EquipmentSlot, ItemStack } from '@minecraft/server';
import { RegisterPower } from '../Registries';
import { Power } from '../Ability';

@RegisterPower
export class WeakArms implements Power {
	readonly id = 'weak_arms';
	readonly tickInterval = 2;

	onRelease(player: Player): void {
		player.removeEffect('minecraft:weakness');
		player.removeEffect('minecraft:mining_fatigue');
	}

	onTick(player: Player): void {
		if (player.getEffect('minecraft:strength')) {
			player.removeEffect('minecraft:weakness');
			player.removeEffect('minecraft:mining_fatigue');
			return;
		}

		const equippableComp = player.getComponent('equippable');
		const heldItem = equippableComp?.getEquipment(EquipmentSlot.Mainhand);

		if (!heldItem || !WeakArms.isTool(heldItem) || !WeakArms.hasEfficiency(heldItem)) {
			player.addEffect('minecraft:mining_fatigue', TicksPerSecond * 12, {
				amplifier: 0,
				showParticles: false
			});
		} else {
			player.removeEffect('minecraft:mining_fatigue');
		}

		player.addEffect('minecraft:weakness', TicksPerSecond * 12, {
			amplifier: 0,
			showParticles: false
		});
	}

	private static hasEfficiency(item: ItemStack): boolean {
		try {
			const enchants: any = item.getComponent('enchantments');
			if (!enchants) return false;
			const efficiency = enchants.enchantments.getEnchantment('minecraft:efficiency');
			return efficiency && efficiency.level > 0;
		} catch {
			return false;
		}
	}

	private static isTool(item: ItemStack): boolean {
		const id = item.typeId ?? '';
		return (
			id.includes('pickaxe') ||
			id.includes('shovel') ||
			id.includes('axe') ||
			id.includes('hoe')
		);
	}
}
