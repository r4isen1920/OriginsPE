import { Power } from '../Ability';
import { RegisterPower } from '../Registries';
import { Player } from '@minecraft/server';

/**
 * Granted by default to every player. Acts as a passive marker that other
 * systems (e.g. web placement / web-trap lifetime) can key off of.
 *
 * Implementation deferred.
 */
@RegisterPower
export class MasterOfWebs implements Power {
	readonly id = 'master_of_webs';
	readonly tickInterval = 5;

	onTick(player: Player): void {
		const loc = player.location;
		const block = player.dimension.getBlock(loc);

		if (
			block?.typeId === 'minecraft:web' ||
			block?.typeId === 'r4isen1920_originspe:fake_web'
		) {
			player.addEffect('resistance', 2, {
				amplifier: 4,
				showParticles: false
			});
		}
	}
}
