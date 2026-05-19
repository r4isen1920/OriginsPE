import { Player } from '@minecraft/server';

import { Perk } from '../Ability';
import { RegisterPerk } from '../Registries';
import { ItemUtils } from '../../utils/ItemUtils';


/**
 * Animals you tame receive a permanent buff to their health.
 */
@RegisterPerk
export class FaunaFriends implements Perk {
	readonly id = 'fauna_friends';

	onTick(player: Player): void {
		if (checkBone(player)) {
			player.addTag('perk_tamed_animal_boost');
		} else {
			player.removeTag('perk_tamed_animal_boost');
		}
	}
}

function checkBone(player: Player): boolean {
	const container = ItemUtils.container(player);
	if (!container) return false;

	const selectedSlot = player.selectedSlotIndex;
	if (selectedSlot < 0 || selectedSlot >= container.size) return false;

	const item = container.getItem(selectedSlot);
	if (!item) return false;

	const typeId = item.typeId.toLowerCase();
	if (!typeId.includes('bone')) return false;

	return true;
}