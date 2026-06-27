import { RegisterPower } from '../../core/abilities/Registries';
import { Power } from '../../core/abilities/Ability';
import { Player, world, TicksPerSecond } from '@minecraft/server';

/** When night falls, Crimson Tracker gains 20% damage reduction (Resistance I) and NightVision. */
@RegisterPower
export class NightFalls implements Power {
	readonly id = 'night_falls';
	readonly tickInterval = 4;

	onRelease(player: Player): void {
		player.removeEffect('resistance');
		player.removeEffect('night_vision');
	}

	onTick(player: Player): void {
		if (!player.isValid) return;

		if (player.dimension.id !== 'minecraft:overworld') {
			player.removeEffect('resistance');
			player.removeEffect('night_vision');
			return;
		}

		const time = world.getTimeOfDay();
		const isNight = time >= 12000 && time <= 23999;

		if (!isNight) {
			player.removeEffect('resistance');
			player.removeEffect('night_vision');
			return;
		}

		player.addEffect('resistance', 250, { amplifier: 0, showParticles: false });
		player.addEffect('night_vision', 250, { amplifier: 0, showParticles: false });
	}
}
