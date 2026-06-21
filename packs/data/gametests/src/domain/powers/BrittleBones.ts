import { Player, EntityDamageCause, EntityHurtBeforeEvent } from '@minecraft/server';
import { RegisterPower } from '../../core/abilities/Registries';
import { Power } from '../../core/abilities/Ability';

/**
 * Brittle Bones is a passive power that increases the damage taken by the holder
 * when they fall or fly into a wall.
 */

@RegisterPower
export class BrittleBones implements Power {
	readonly id = 'more_kinetic_damage';

	onHurtBefore(_player: Player, ev: EntityHurtBeforeEvent): void {
		if (
			ev.damageSource.cause === EntityDamageCause.fall ||
			ev.damageSource.cause === EntityDamageCause.flyIntoWall
		) {
			ev.damage = ev.damage * 1.5;
		}
	}
}
