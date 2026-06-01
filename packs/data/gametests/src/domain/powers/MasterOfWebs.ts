import { Power } from '../Ability';
import { RegisterPower } from '../Registries';
import { Player } from '@minecraft/server';
import { PlayerTick } from '../../core/Ticker';

/**
 * Granted by default to every player. Acts as a passive marker that other
 * systems (e.g. web placement / web-trap lifetime) can key off of.
 *
 * Implementation deferred.
 */
@RegisterPower
export class MasterOfWebs implements Power {
	readonly id = 'master_of_webs';

	@PlayerTick(5)
	static onTick(player: Player): void {
		try {
			const loc = player.location;
			const blockLoc = {
				x: Math.floor(loc.x),
				y: Math.floor(loc.y),
				z: Math.floor(loc.z)
			};

			const block = player.dimension.getBlock(blockLoc);
			if (
				block?.typeId === 'minecraft:web' ||
				block?.typeId === 'r4isen1920_originspe:fake_web'
			) {
				player.addEffect('resistance', 5, {
					amplifier: 4,
					showParticles: false
				});
			}
		} catch {}
	}
}
