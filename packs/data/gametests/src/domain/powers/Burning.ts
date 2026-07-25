import { EntityDamageCause } from '@minecraft/server';
import { Power } from '../../core/abilities/Ability';
import { RegisterPower } from '../../core/abilities/Registries';
import { AttributeOverrides } from '../../services';

@RegisterPower
export class Burning implements Power {
	readonly id = 'burning';

	readonly attributes: AttributeOverrides = {
		damageOverrides: [
			{
				id: 'fire',
				cause: EntityDamageCause.fire,
				multiplier: 2
			},
			{
				id: 'fire_tick',
				cause: EntityDamageCause.fireTick,
				multiplier: 2
			}
		]
	};
}
