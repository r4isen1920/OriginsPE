import { Player } from '@minecraft/server';
import { RegisterPower } from '../Registries';
import { Power } from '../Ability';

/**
 * Hotblooded: Blazeborn with this power are resistant to poison and hunger effects. 
 * When they would be affected by poison or hunger,
 * the effect is instead removed and they play a sizzling sound and emit lava particles.
 */

@RegisterPower
export class Hotblooded implements Power {
	readonly id = 'hotblooded';
	readonly tickInterval = 3;

	onTick(player: Player): void {
		const hasPoison = player.getEffect('poison');
		const hasFatalPoison = player.getEffect('fatal_poison');
		const hasHunger = player.getEffect('hunger');

		if (hasPoison || hasFatalPoison || hasHunger) {
			player.removeEffect('poison');
			player.removeEffect('fatal_poison');
			player.removeEffect('hunger');

			const soundLoc = player.location;
			player.dimension.playSound('random.fizz', soundLoc, { pitch: 1.25 });

			const particleLoc = {
				x: player.location.x,
				y: player.location.y + 0.75,
				z: player.location.z
			};
			player.dimension.spawnParticle('minecraft:lava_particle', particleLoc);
		}
	}
}
