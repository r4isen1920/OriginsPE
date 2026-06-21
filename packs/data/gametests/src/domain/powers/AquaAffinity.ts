import { Player, TicksPerSecond } from '@minecraft/server';
import { Power } from '../../core/abilities/Ability';
import { RegisterPower } from '../../core/abilities/Registries';

@RegisterPower
export class AquaAffinity implements Power {
	readonly id = 'aqua_affinity';
	readonly tickInterval = 3;

	onTick(player: Player): void {
		if (!player.isInWater) {
			player.removeEffect('night_vision');
			player.removeEffect('water_breathing');
			player.removeEffect('haste');
			return;
		}
		player.addEffect('night_vision', TicksPerSecond * 12, {
			amplifier: 4,
			showParticles: false
		});

		player.addEffect('water_breathing', TicksPerSecond * 12, {
			amplifier: 0,
			showParticles: false
		});

		player.addEffect('haste', TicksPerSecond * 12, {
			amplifier: 2,
			showParticles: false
		});
	}
}
