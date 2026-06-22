import { Player, TicksPerSecond, EquipmentSlot, ItemStack } from '@minecraft/server';
import { RegisterPower } from '../../core/abilities/Registries';
import { Power } from '../../core/abilities/Ability';

@RegisterPower
export class WeakArms implements Power {
	readonly id = 'weak_arms';
	readonly tickInterval = 2;

	onTick(player: Player): void {
		if (player.getEffect('strength')) {  // remove 'minecraft:' prefix
			player.removeEffect('weakness');
			player.removeEffect('mining_fatigue');
			return;
		}

		const equippableComp = player.getComponent('equippable');
		const heldItem = equippableComp?.getEquipment(EquipmentSlot.Mainhand);

		if (!heldItem || !WeakArms.isTool(heldItem) || !WeakArms.hasEfficiency(heldItem)) {
			player.addEffect('mining_fatigue', TicksPerSecond * 12, {
				amplifier: 0,
				showParticles: false,
			});
		} else {
			player.removeEffect('mining_fatigue');
		}

		player.addEffect('weakness', TicksPerSecond * 12, {
			amplifier: 0,
			showParticles: false,
		});
	}

	onRelease(player: Player): void {
		player.removeEffect('weakness');
		player.removeEffect('mining_fatigue');
	}

	private static hasEfficiency(item: ItemStack): boolean {
		const enchants: any = item.getComponent('enchantments');
		if (!enchants) return false;
		const efficiency = enchants.enchantments.getEnchantment('minecraft:efficiency');
		return efficiency && efficiency.level > 0;
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
