import { Player, EntityDamageCause, world } from '@minecraft/server';
import { Power } from '../Ability';
import { PlayerState } from '../../core/PlayerState';
import { RegisterPower } from '../Registries';

@RegisterPower
export class Oceans_gift implements Power {
	readonly id = 'oceans_gift';

	constructor() {
		world.afterEvents.entityHurt.subscribe((event) => {
			const { damage, damageSource, hurtEntity } = event;

			if (hurtEntity.typeId !== 'minecraft:player') return;

			try {
				const player = hurtEntity as Player;
				const state = PlayerState.for(player);
				if (state.getOrigin() !== 'merling') return;

				if (
					damageSource.cause !== EntityDamageCause.projectile ||
					damageSource.damagingProjectile?.typeId !== 'minecraft:thrown_trident'
				)
					return;

				player.dimension.spawnParticle('r4isen1920_originspe:bubbles', player.location);
				player.dimension.playSound('ui.enchant', player.location, { pitch: 1.5 });

				const health = player.getComponent('health');
				if (health) {
					health.setCurrentValue(health.currentValue + damage);
				}
			} catch {}
		});
	}
}
