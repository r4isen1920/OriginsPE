import { Player, world, EntityDamageCause } from '@minecraft/server';
import { RegisterPower } from '../Registries';
import { Power } from '../Ability';
import { PlayerState } from '../../core/PlayerState';
import { Log } from '../../utils/Log';

/**
 * Brittle Bones is a passive power that increases the damage taken by Elytrians when they fall or hit a wall.
 */

@RegisterPower
export class Brittle_bones implements Power {
	readonly id = 'brittle_bones';
	private static readonly log = Log.get('Brittle_bones');

	constructor() {
		world.afterEvents.entityHurt.subscribe((event) => {
			try {
				const { damage, damageSource, hurtEntity } = event;

				if (!(hurtEntity instanceof Player)) return;

				const state = PlayerState.for(hurtEntity);
				if (state.getOrigin() !== 'elytrian') return;

				if (damageSource.cause === EntityDamageCause.override) return;

				if (
					damageSource.cause === EntityDamageCause.fall ||
					damageSource.cause === EntityDamageCause.flyIntoWall
				) {
					const extraDamage = Math.floor(damage * 0.5);
					if (extraDamage <= 0) return;

					hurtEntity.applyDamage(extraDamage, {
						cause: EntityDamageCause.override,
						damagingEntity: damageSource.damagingEntity
					});
				}
			} catch (error: any) {
				Brittle_bones.log.error(
					`Error inside Brittle Bones damage handler: ${error?.stack ?? error}`
				);
			}
		});
	}
}
