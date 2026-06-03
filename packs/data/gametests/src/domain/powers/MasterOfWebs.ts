import { Power } from '../Ability';
import { RegisterPower } from '../Registries';
import { Player } from '@minecraft/server';
import { Log } from '../../utils/Log';

@RegisterPower
export class MasterOfWebs implements Power {
	readonly id = 'master_of_webs';
	readonly tickInterval = 5;

	private static readonly log = Log.get('MasterOfWebs');

	onTick(player: Player): void {
		if (!player.isValid) return;

		const dimension = player.dimension;
		if (!dimension) return;

		const loc = player.location;

		const feetBlock = dimension.getBlock({ x: loc.x, y: loc.y, z: loc.z });
		const torsoBlock = dimension.getBlock({ x: loc.x, y: loc.y + 1, z: loc.z });

		const standsInWeb =
			(feetBlock?.isValid &&
				(feetBlock.typeId === 'minecraft:web' ||
					feetBlock.typeId === 'r4isen1920_originspe:fake_web')) ||
			(torsoBlock?.isValid &&
				(torsoBlock.typeId === 'minecraft:web' ||
					torsoBlock.typeId === 'r4isen1920_originspe:fake_web'));

		if (standsInWeb) {
			player.addEffect('resistance', 20, {
				amplifier: 4,
				showParticles: false
			});
		}
	}
}
