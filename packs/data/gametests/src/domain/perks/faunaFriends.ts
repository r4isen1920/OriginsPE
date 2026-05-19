import { Player } from '@minecraft/server';

import { Perk } from '../Ability';
import { RegisterPerk } from '../Registries';


/**
 * Animals you tame receive a permanent buff to their health.
 */
@RegisterPerk
export class FaunaFriends implements Perk {
	readonly id = 'fauna_friends';

	onTick(player: Player): void {
		if (player.hasTag('perk_tamed_animal_boost')) return;
		player.addTag('perk_tamed_animal_boost');
	}

	onRelease(player: Player): void {
		player.removeTag('perk_tamed_animal_boost');
	}
}