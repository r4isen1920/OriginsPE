import { RegisterPower } from '../../core/abilities/Registries';
import { Power } from '../../core/abilities/Ability';


/**
 * Even without wearing armor, your skin provides natural protection thus receiving 20% less damage from any source.
 */
@RegisterPower
export class NaturalArmor implements Power {
	readonly id = 'natural_armor';

	readonly attributes = {
		damageOverrides: [
			{
				id: 'natural_armor',
				multiplier: 0.8,
			},
		],
	};
}