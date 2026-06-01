import { Player } from '@minecraft/server';
import { RegisterPower } from '../Registries';
import { Power } from '../Ability';
import { FlagService } from '../../services/FlagService';

/**
 * Divine_Aura: the holder permanently glows with a divine aura.
 */

@RegisterPower
export class DivineAura implements Power {
	readonly id = 'divine_aura';
	readonly tickInterval = 10;

	onRelease(player: Player): void {
		FlagService.set(player, 'flag_a', false);
	}

	onTick(player: Player): void {
		FlagService.set(player, 'flag_a', true);
	}
}
