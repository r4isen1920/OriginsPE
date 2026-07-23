import { Player, TicksPerSecond } from '@minecraft/server';
import { RegisterPower } from '../../core/abilities/Registries';
import { Power } from '../../core/abilities/Ability';
import { EntityUtils } from '../../utils/EntityUtils';

/** Vampire
 * At night, you are able to see more clearly with night vision, and speed.
 */

@RegisterPower
export class Nocturnal implements Power {
	readonly id = 'nocturnal';
	readonly tickInterval = 3;

	onRelease(player: Player): void {
		player.removeEffect('night_vision');
		player.removeEffect('speed');
	}

	onTick(player: Player): void {
		const lightLevel = EntityUtils.getLightLevel(player);

		if (lightLevel < 8) {
			player.addEffect('night_vision', TicksPerSecond * 12, { showParticles: false });
			player.addEffect('speed', TicksPerSecond * 12, {
				amplifier: 0,
				showParticles: false
			});
		} else {
			player.removeEffect('night_vision');
			player.removeEffect('speed');
		}
	}
}
