import { EntityDamageCause } from '@minecraft/server';
import { RegisterPower } from '../../core/abilities/Registries';
import { Power } from '../../core/abilities/Ability';
import { AttributeOverrides } from '../../services';

@RegisterPower
export class SurgeProtection implements Power {
	readonly id = 'surge_protection';
	readonly tickInterval = 3;

	readonly attributes: AttributeOverrides = {
		damageOverrides: [
			{
				cause: EntityDamageCause.lightning,
				multiplier: 0,
			},
			{
				cause: EntityDamageCause.fireTick,
				multiplier: 0,
			},
			{
				cause: EntityDamageCause.fire,
				multiplier: 0,
			}
		]
	}
}
