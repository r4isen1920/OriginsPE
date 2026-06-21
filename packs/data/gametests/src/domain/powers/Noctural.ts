import { Player, TicksPerSecond } from '@minecraft/server';
import { RegisterPower } from '../../core/abilities/Registries';
import { Power } from '../../core/abilities/Ability';
import { EntityUtils } from '../../utils/EntityUtils';

@RegisterPower
export class Noctural implements Power {
	readonly id = 'cat_vision';
	readonly tickInterval = 3;

	onRelease(player: Player): void {
		player.removeEffect('night_vision');
		player.removeEffect('strength');
	}

	onTick(player: Player): void {
		const lightLevel = EntityUtils.getLightLevel(player);

		if (lightLevel < 8) {
			player.addEffect('night_vision', TicksPerSecond * 12, { showParticles: false });
			player.addEffect('strength', TicksPerSecond * 12, {
				amplifier: 0,
				showParticles: false
			});
		} else {
			player.removeEffect('night_vision');
			player.removeEffect('strength');
		}
	}
}
