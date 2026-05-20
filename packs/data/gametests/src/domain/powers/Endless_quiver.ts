import { Player, EquipmentSlot, ItemStack } from '@minecraft/server';
import { RegisterPower } from '../Registries';
import { Power } from '../Ability';
import { PlayerTick } from '../../core/Ticker';
import { PlayerState } from '../../core/PlayerState';
import { Log } from '../../utils/Log';

/**
 * EndlessQuiver: Players with this power have an endless supply of arrows.
 */

@RegisterPower
export class EndlessQuiver implements Power {
	readonly id = 'endless_quiver';
	private static readonly log = Log.get('EndlessQuiver');
	private static readonly ARROW_LORE = '§r§6Endless Quiver§r';

	@PlayerTick(3)
	static onPlayerTick(player: Player): void {
		try {
			const state = PlayerState.for(player);
			if (state.getOrigin() !== 'elf') return;

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
					const newArrow = new ItemStack('minecraft:arrow', 1);
					newArrow.setLore([EndlessQuiver.ARROW_LORE]);

					inventoryComp.container.addItem(newArrow);

					try {
						player.playSound('note.pling', { volume: 0.1, pitch: 1.75 });
						player.playSound('mob.chicken.plop', { volume: 0.75 });
					} catch {}
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
		} catch (error: any) {
			EndlessQuiver.log.error(
				`Error inside EndlessQuiver ticker handler: ${error?.stack ?? error}`
			);
		}
	}
}
