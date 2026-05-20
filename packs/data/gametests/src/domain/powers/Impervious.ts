import { Player, world, EntityDamageCause, TicksPerSecond } from '@minecraft/server';
import { RegisterPower } from '../Registries';
import { Power } from '../Ability';
import { PlayerState } from '../../core/PlayerState';
import { Log } from '../../utils/Log';

/**
 * Impervious: Makes the player immune to fire and lava damage.
 */

@RegisterPower
export class Impervious implements Power {
	readonly id = 'impervious';
	private static readonly log = Log.get('Impervious');

	constructor() {
		world.afterEvents.entityHurt.subscribe((event) => {
			try {
				const { damage, damageSource, hurtEntity } = event;

				if (!(hurtEntity instanceof Player)) return;

				const state = PlayerState.for(hurtEntity);
				if (state.getOrigin() !== 'blazeborn') return;

				if (
					damageSource.cause === EntityDamageCause.fire ||
					damageSource.cause === EntityDamageCause.lava ||
					damageSource.cause === EntityDamageCause.fireTick ||
					damageSource.cause === EntityDamageCause.magma
				) {
					const healthComponent = hurtEntity.getComponent('health');
					if (healthComponent) {
						healthComponent.setCurrentValue(healthComponent.currentValue + damage);
					}

					hurtEntity.addEffect('strength', TicksPerSecond * 12, { amplifier: 1 });
					hurtEntity.dimension.spawnParticle(
						'r4isen1920_originspe:blaze_aura',
						hurtEntity.location
					);
				}
			} catch (error: any) {
				Impervious.log.error(
					`Error inside Impervious damage handler: ${error?.stack ?? error}`
				);
			}
		});
	}
}
