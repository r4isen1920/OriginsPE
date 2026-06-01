import { Player, EntityDamageCause, EntityHurtBeforeEvent, TicksPerSecond } from '@minecraft/server';
import { RegisterPower } from '../Registries';
import { Power } from '../Ability';

/**
 * Impervious: Makes the holder immune to fire and lava damage, gaining strength instead.
 */

@RegisterPower
export class Impervious implements Power {
	readonly id = 'impervious';

	onHurtBefore(player: Player, ev: EntityHurtBeforeEvent): void {
		if (
			ev.damageSource.cause === EntityDamageCause.fire ||
			ev.damageSource.cause === EntityDamageCause.lava ||
			ev.damageSource.cause === EntityDamageCause.fireTick ||
			ev.damageSource.cause === EntityDamageCause.magma
		) {
			ev.damage = 0;
			player.addEffect('strength', TicksPerSecond * 12, { amplifier: 1 });
			player.dimension.spawnParticle(
				'r4isen1920_originspe:blaze_aura',
				player.location
			);
		}
	}
}
