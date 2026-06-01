import { Player } from '@minecraft/server';
import { RegisterPower } from '../Registries';
import { Power } from '../Ability';
import { AttributeService } from '../../services/AttributeService';

/**
 * Swift: Players with this power have increased movement speed.
 */

@RegisterPower
export class Swift implements Power {
	readonly id = 'swift';
	readonly tickInterval = 5;

	onRelease(player: Player): void {
		AttributeService.apply(player, { movement: 0.1 });
	}

	onTick(player: Player): void {
		AttributeService.apply(player, { movement: 0.15 });
	}
}
