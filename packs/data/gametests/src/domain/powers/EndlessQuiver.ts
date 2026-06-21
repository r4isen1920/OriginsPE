import { Player, EquipmentSlot, ItemStack, TicksPerSecond, system } from '@minecraft/server';
import { RegisterPower } from '../../core/abilities/Registries';
import { Power } from '../../core/abilities/Ability';
import { ResourceBarService } from '../../services/ResourceBarService';
import { PlayerState } from '../../core/platform/PlayerState';
/**
 * EndlessQuiver: Players with this power have an endless supply of arrows.
 * Loose: dispatched to whoever is granted the power, with no origin coupling.
 */
@RegisterPower
export class EndlessQuiver implements Power {
	readonly id = 'endless_quiver';
	readonly icon = '17';
	readonly tickInterval = 3;

	private static readonly RESOURCE_BAR_ID = 17;
	private static readonly ARROW_LORE = '§r§6Endless Quiver§r';
	private static readonly COOLDOWN_LORE = TicksPerSecond * 2;

	onTick(player: Player): void {
		const inventoryComp = player.getComponent('inventory');
		const equippableComp = player.getComponent('equippable');
		if (!inventoryComp?.container || !equippableComp) return;

		const mainhandItem = equippableComp.getEquipment(EquipmentSlot.Mainhand);
		const hasBowInHand = mainhandItem && mainhandItem.typeId.includes('bow');

		let totalArrowCount = 0;
		let customArrowSlot = -1;

		for (let i = 0; i < inventoryComp.container.size; i++) {
			const item = inventoryComp.container.getItem(i);
			if (!item || item.typeId !== 'minecraft:arrow') continue;

			totalArrowCount += item.amount;
			const lore = item.getLore();
			if (lore && lore.includes(EndlessQuiver.ARROW_LORE)) {
				customArrowSlot = i;
			}
		}

		if (hasBowInHand) {
			if (totalArrowCount === 0) {
				const state = PlayerState.for(player);
				if (!state.hasPower('endless_quiver')) return;

				const now = system.currentTick;
				if (state.isOnCooldown(EndlessQuiver.ARROW_LORE, now)) return;

				state.setCooldown(EndlessQuiver.ARROW_LORE, now, EndlessQuiver.COOLDOWN_LORE);
				ResourceBarService.push(player, {
					id: EndlessQuiver.RESOURCE_BAR_ID,
					durationSeconds: 2
				});

				const newArrow = new ItemStack('minecraft:arrow', 1);
				newArrow.setLore([EndlessQuiver.ARROW_LORE]);
				inventoryComp.container.addItem(newArrow);

				player.playSound('note.pling', { volume: 0.1, pitch: 1.75 });
				player.playSound('mob.chicken.plop', { volume: 0.75 });
			} else if (totalArrowCount > 1 && customArrowSlot !== -1) {
				const customArrow = inventoryComp.container.getItem(customArrowSlot);
				if (customArrow) {
					if (customArrow.amount > 1) {
						customArrow.amount -= 1;
						inventoryComp.container.setItem(customArrowSlot, customArrow);
					} else {
						inventoryComp.container.setItem(customArrowSlot, undefined);
					}
				}
			}
		} else {
			if (customArrowSlot !== -1) {
				inventoryComp.container.setItem(customArrowSlot, undefined);
			}
		}
	}
}
