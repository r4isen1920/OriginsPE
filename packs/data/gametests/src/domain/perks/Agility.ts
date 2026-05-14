import { Player, world, system, EquipmentSlot } from '@minecraft/server';

import { Perk } from '../Ability';
import { RegisterPerk } from '../Registries';
import { ItemUtils } from '../../utils/ItemUtils';


/**
 * When wielding a bow, increases movement speed by 10%
 * and jump height by 20% while the bow is held.
 */
@RegisterPerk
export class Agility implements Perk {
	readonly id = 'agility';

	onTick(player: Player): void {
		
		//check if player is holding a bow, if not, return
		if (!checkBow(player)) return;
		
		player.addEffect('speed', 10, { amplifier: 1, showParticles: false });
		player.addEffect('jump_boost', 10, { amplifier: 1, showParticles: false });
	}
}

function checkBow(player: Player): boolean {
	const container = ItemUtils.container(player);
	if (!container) return false;

	const selectedSlot = player.selectedSlotIndex;
	if (selectedSlot < 0 || selectedSlot >= container.size) return false;

	const item = container.getItem(selectedSlot);
	if (!item) return false;

	const typeId = item.typeId.toLowerCase();
	if (!typeId.includes('bow') || typeId.includes('bowl')) return false;

	return true;
	
	// world.afterEvents.itemUse.subscribe((event) => {
	// 	const { source, itemStack } = event;

	// 	if (itemStack.typeId === "minecraft:bow" && source.id === player.id) {
	// 		player.addEffect('speed', 20, { amplifier: 1, showParticles: false });
	// 		player.addEffect('jump_boost', 20, { amplifier: 1, showParticles: false });
	// 	}
	// });
}