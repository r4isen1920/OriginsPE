import { Player, EntityHurtBeforeEvent } from '@minecraft/server';
import { RegisterPower } from '../Registries';
import { Power } from '../Ability';

/**
 * Permeable: the holder takes 10% more damage from all sources.
 */

@RegisterPower
export class Permeable implements Power {
	readonly id = 'permeable';

	onHurtBefore(_player: Player, ev: EntityHurtBeforeEvent): void {
		ev.damage = ev.damage * 1.1;
	}
}
