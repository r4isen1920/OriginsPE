import { Player } from '@minecraft/server';

import { Perk } from '../../core/abilities/Ability';
import { RegisterPerk } from '../../core/abilities/Registries';


/**
 * Animals you tame receive a permanent buff to their health.
 */
@RegisterPerk
export class FaunaFriends implements Perk {
	readonly id = 'tamed_animal_boost';

	onTick(player: Player): void {
		if (player.hasTag('perk_tamed_animal_boost')) return;
		player.addTag('perk_tamed_animal_boost');
	}

	onRelease(player: Player): void {
		player.removeTag('perk_tamed_animal_boost');
	}
}