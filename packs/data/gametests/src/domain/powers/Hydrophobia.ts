import { Player, EntityDamageCause } from '@minecraft/server';
import { RegisterPower } from '../Registries';
import { Power } from '../Ability';

/**
 * Hydrophobia: this power take damage when swimming or submerged in water.
 * They also play a sizzling sound and emit lava particles while in water.
 */

@RegisterPower
export class Hydrophobia implements Power {
	readonly id = 'hydrophobia';
	readonly tickInterval = 20;

	onTick(player: Player): void {
		if (player.isSwimming || player.isInWater) {
			player.applyDamage(1, { cause: EntityDamageCause.drowning });
			player.dimension.playSound('random.fizz', player.location, {
				pitch: 1.5,
				volume: 0.5
			});
			player.dimension.spawnParticle('minecraft:lava_particle', {
				x: player.location.x,
				y: player.location.y + 1,
				z: player.location.z
			});
		}
	}
}
