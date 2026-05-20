import { Player, world, EntityDamageCause } from '@minecraft/server';
import { RegisterPower } from '../Registries';
import { Power } from '../Ability';
import { PlayerState } from '../../core/PlayerState';
import { Log } from '../../utils/Log';

/**
 * Permeable: Players with this power take 10% more damage from all sources, 
 * but are able to pass through certain blocks (not implemented in this test).
 */

@RegisterPower
export class Permeable implements Power {
	readonly id = 'permeable';
	private static readonly log = Log.get('Permeable');

	constructor() {
		world.afterEvents.entityHurt.subscribe((event) => {
			try {
				const { damage, damageSource, hurtEntity } = event;

				if (!(hurtEntity instanceof Player)) return;

				const state = PlayerState.for(hurtEntity);
				if (state.getOrigin() !== 'elf') return;

				if (damageSource.cause === EntityDamageCause.override) return;

				const bonusDamage = Math.floor(damage * 0.1);
				if (bonusDamage <= 0) return;

				hurtEntity.applyDamage(bonusDamage, {
					cause: EntityDamageCause.override,
					damagingEntity: damageSource.damagingEntity
				});
			} catch (error: any) {
				Permeable.log.error(
					`Error inside Permeable damage modifier: ${error?.stack ?? error}`
				);
			}
		});
	}
}
