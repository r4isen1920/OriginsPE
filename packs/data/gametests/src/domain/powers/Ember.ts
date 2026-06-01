import { Player, system, EntityHitEntityAfterEvent } from '@minecraft/server';
import { RegisterPower } from '../Registries';
import { Power } from '../Ability';
import { PlayerState } from '../../core/PlayerState';

/**
 * Ember: when the holder hits an entity while on fire, they set the target and
 * nearby entities on fire for a duration based on the target's current health.
 */

@RegisterPower
export class Ember implements Power {
	readonly id = 'ember';

	onAttack(player: Player, ev: EntityHitEntityAfterEvent): void {
		const hitEntity = ev.hitEntity;
		if (!hitEntity) return;

		if (!player.getComponent('onfire')) return;

		const state = PlayerState.for(player);
		const currentTick = system.currentTick;
		if (state.isOnCooldown('ember_cooldown', currentTick)) return;

		const healthComponent = hitEntity.getComponent('health');
		const strengthEffect = player.getEffect('strength');
		const strengthAmplifier = strengthEffect ? strengthEffect.amplifier : -1;

		const fireDuration =
			(healthComponent?.currentValue ?? 20) / 2 + (strengthAmplifier + 1) * 2;

		const targets = player.dimension.getEntities({
			location: hitEntity.location,
			maxDistance: 4,
			excludeFamilies: ['inanimate']
		});

		for (const entity of targets) {
			entity.setOnFire(fireDuration, false);
		}

		hitEntity.dimension.spawnParticle(
			'r4isen1920_originspe:blaze_impact',
			hitEntity.location
		);
		player.dimension.playSound('mob.ghast.fireball', hitEntity.location, {
			pitch: 1.25
		});

		state.setCooldown('ember_cooldown', currentTick, 60);
	}
}
