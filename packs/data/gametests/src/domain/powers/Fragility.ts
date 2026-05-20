import { Player, world } from '@minecraft/server';
import { RegisterPower } from '../Registries';
import { Power } from '../Ability';
import { PlayerState } from '../../core/PlayerState';
import { Log } from '../../utils/Log';

/**
 * Fragility: Players with this power take increased damage when their health is low.
 */

@RegisterPower
export class Fragility implements Power {
	readonly id = 'fragility';
	private static readonly log = Log.get('Fragility');

	constructor() {
		world.afterEvents.entityHurt.subscribe((event) => {
			try {
				const { damage, damageSource, hurtEntity } = event;

				if (!(hurtEntity instanceof Player)) return;

				const state = PlayerState.for(hurtEntity);
				if (state.getOrigin() !== 'diviner') return;

				if (damageSource.cause === 'override') return;

				const healthComponent = hurtEntity.getComponent('health');
				if (!healthComponent) return;

				const effectiveMax = healthComponent.effectiveMax || 20;
				const healthPercentage =	
					50 - Math.floor((healthComponent.currentValue / effectiveMax) * 50);

				if (healthPercentage <= 0) return;

				const extraDamage = Math.floor(damage * (healthPercentage / 100));
				if (extraDamage <= 0) return;

				hurtEntity.applyDamage(extraDamage, {
					cause: damageSource.cause,
					damagingEntity: damageSource.damagingEntity
				});
			} catch (error: any) {
				Fragility.log.error(
					`Error inside Fragility damage modifier: ${error?.stack ?? error}`
				);
			}
		});
	}
}
