import { EntityDamageCause } from '@minecraft/server';
import { RegisterPower } from '../../core/abilities/Registries';
import { Power } from '../../core/abilities/Ability';
import { AttributeOverrides } from '../../services';



@RegisterPower
export class BrittleBones implements Power {
	readonly id = 'more_kinetic_damage';

	readonly attributes: AttributeOverrides = {
		damageOverrides: [
			{
				cause: EntityDamageCause.fall,
				multiplier: 1.5
			},
			{
				cause: EntityDamageCause.flyIntoWall,
				multiplier: 1.5
			}
		]
	}
}
