import { EntityComponentTypes, EntityHealthComponent, EntityHurtBeforeEvent, Player } from '@minecraft/server';

import { Power } from '../../core/abilities/Ability';
import { RegisterPower } from '../../core/abilities/Registries';


/**
 * Fragility: passive Diviner power. Incoming damage scales up the lower the
 * holder's health is: 1.0x at 20+ health, plus 0.05x for each health point below 20.
 */
@RegisterPower
export class Fragility implements Power {
	readonly id = 'fragility';

	onHurtBefore(player: Player, ev: EntityHurtBeforeEvent): void {
		const health = player.getComponent(EntityComponentTypes.Health) as EntityHealthComponent | undefined;
		if (!health) return;

		const missing = 20 - Math.floor(health.currentValue);
		if (missing <= 0) return;

		ev.damage = ev.damage * (1 + missing * 0.05);
	}
}
