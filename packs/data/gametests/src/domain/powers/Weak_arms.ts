import { Player, TicksPerSecond, EquipmentSlot, ItemStack } from '@minecraft/server';
import { RegisterPower } from '../Registries';
import { Power } from '../Ability';
import { PlayerTick } from '../../core/Ticker';
import { PlayerState } from '../../core/PlayerState';
import { Log } from '../../utils/Log';

@RegisterPower
export class WeakArms implements Power {
	readonly id = 'weak_arms';
	private static readonly log = Log.get('WeakArms');

	@PlayerTick(2)
	static onPlayerTick(player: Player): void {
		try {
			const state = PlayerState.for(player);
			if (state.getOrigin() !== 'feline') return;

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
		} catch (error: any) {
			WeakArms.log.error(`Error inside WeakArms tick handler: ${error?.stack ?? error}`);
		}
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
