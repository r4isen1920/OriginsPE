import { Power } from '../Ability';
import { RegisterPower } from '../Registries';
import { Player } from '@minecraft/server';
import { Ticker } from '../../core/Ticker';
import { Log } from '../../utils/Log';

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

	private static readonly log = Log.get('MasterOfWebs');

	constructor() {
		try {
			Ticker.everyPlayer(this.tickInterval, (player) => this.onTick(player), {
				id: `power.${this.id}`
			});
		} catch (error: any) {
			MasterOfWebs.log.error(
				`Failed to register Ticker hook for MasterOfWebs: ${error?.stack ?? error}`
			);
		}
	}

	onTick(player: Player): void {
		try {
			if (!player.isValid) return;

			const loc = player.location;
			const blockLoc = {
				x: Math.floor(loc.x),
				y: Math.floor(loc.y),
				z: Math.floor(loc.z)
			};

			const dimension = player.dimension;
			if (!dimension) return;

			const block = dimension.getBlock(blockLoc);
			if (!block || !block.isValid) return;

			if (
				block.typeId === 'minecraft:web' ||
				block.typeId === 'r4isen1920_originspe:fake_web'
			) {
				player.addEffect('resistance', 5, {
					amplifier: 4,
					showParticles: false
				});
			}
		} catch (error: any) {
			MasterOfWebs.log.error(
				`[${player.name ?? 'Unknown Player'}] Error in onTick loop: ${error?.stack ?? error}`
			);
		}
	}
}
