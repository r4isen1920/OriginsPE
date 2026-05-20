import { Player, world, system } from '@minecraft/server';
import { RegisterPower } from '../Registries';
import { Power } from '../Ability';
import { PlayerState } from '../../core/PlayerState';
import { Log } from '../../utils/Log';

/**
 * Ember: When a Blazeborn with this power hits an entity while on fire, 
 * they set the target and nearby entities on fire for a duration based on the target's current health.		
 */

@RegisterPower
export class Ember implements Power {
	readonly id = 'ember';
	private static readonly log = Log.get('Ember');

	constructor() {
		world.afterEvents.entityHitEntity.subscribe((event) => {
			try {
				const { damagingEntity, hitEntity } = event;

				if (!(damagingEntity instanceof Player)) return;

				const state = PlayerState.for(damagingEntity);
				if (state.getOrigin() !== 'blazeborn') return;

				if (!damagingEntity.getComponent('onfire')) return;

				const currentTick = system.currentTick;
				if (state.isOnCooldown('ember_cooldown', currentTick)) return;

				const healthComponent = hitEntity.getComponent('health');
				const strengthEffect = damagingEntity.getEffect('strength');
				const strengthAmplifier = strengthEffect ? strengthEffect.amplifier : -1;

				const fireDuration =
					(healthComponent?.currentValue ?? 20) / 2 + (strengthAmplifier + 1) * 2;

				const targets = damagingEntity.dimension.getEntities({
					location: hitEntity.location,
					maxDistance: 4,
					excludeFamilies: ['inanimate']
				});

				for (const entity of targets) {
					if (entity instanceof Player) {
						const targetState = PlayerState.for(entity);
						if (targetState.getOrigin() === 'blazeborn') continue;
					}
					entity.setOnFire(fireDuration, false);
				}

				hitEntity.dimension.spawnParticle(
					'r4isen1920_originspe:blaze_impact',
					hitEntity.location
				);
				damagingEntity.dimension.playSound('mob.ghast.fireball', hitEntity.location, {
					pitch: 1.25
				});

				state.setCooldown('ember_cooldown', currentTick, 60);
			} catch (error: any) {
				Ember.log.error(`Error inside Ember hit handler: ${error?.stack ?? error}`);
			}
		});
	}
}
