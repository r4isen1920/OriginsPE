import { Player } from '@minecraft/server';
import { RegisterPower } from '../Registries';
import { Power } from '../Ability';
import { PlayerTick } from '../../core/Ticker';
import { PlayerState } from '../../core/PlayerState';
import { Log } from '../../utils/Log';

/**
 * Hotblooded: Blazeborn with this power are resistant to poison and hunger effects. 
 * When they would be affected by poison or hunger,
 * the effect is instead removed and they play a sizzling sound and emit lava particles.
 */

@RegisterPower
export class Hotblooded implements Power {
	readonly id = 'hotblooded';
	private static readonly log = Log.get('Hotblooded');

	@PlayerTick(3)
	static onPlayerTick(player: Player): void {
		try {
			const state = PlayerState.for(player);
			if (state.getOrigin() !== 'blazeborn') return;

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
		} catch (error: any) {
			Hotblooded.log.error(
				`Error inside Hotblooded ticker handler: ${error?.stack ?? error}`
			);
		}
	}
}
