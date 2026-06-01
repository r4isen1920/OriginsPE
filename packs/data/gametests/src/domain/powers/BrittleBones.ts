import { Player, EntityDamageCause, EntityHurtBeforeEvent } from '@minecraft/server';
import { RegisterPower } from '../Registries';
import { Power } from '../Ability';

/**
 * Brittle Bones is a passive power that increases the damage taken by the holder
 * when they fall or fly into a wall.
 */

@RegisterPower
export class BrittleBones implements Power {
	readonly id = 'brittle_bones';

	onHurtBefore(player: Player, ev: EntityHurtBeforeEvent): void {
		if (
			ev.damageSource.cause === EntityDamageCause.fall ||
			ev.damageSource.cause === EntityDamageCause.flyIntoWall
		) {
			ev.damage = ev.damage * 1.5;
		}
	}
}
