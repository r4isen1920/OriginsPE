import { Player, TicksPerSecond, world } from '@minecraft/server';
import { RegisterPower } from '../../core/abilities/Registries';
import { Power } from '../../core/abilities/Ability';
import { EntityUtils } from '../../utils/EntityUtils';
import { MinecraftEffectTypes } from '@minecraft/vanilla-data';

/** Vampire
 * At night, you are able to see more clearly with night vision, and speed.
 */

@RegisterPower
export class Nocturnal implements Power {
	readonly id = 'nocturnal';
	readonly tickInterval = 3;

	onRelease(player: Player): void {
		player.removeEffect(MinecraftEffectTypes.NightVision);
		player.removeEffect(MinecraftEffectTypes.Speed);
	}

	onTick(player: Player): void {
		const time = world.getTimeOfDay();
		const isDay = time >= 1000 && time <= 13000;

		if (!isDay) {
			player.addEffect(MinecraftEffectTypes.NightVision, TicksPerSecond * 12, { showParticles: false });
			player.addEffect(MinecraftEffectTypes.Speed, TicksPerSecond * 12, {
				amplifier: 0,
				showParticles: false
			});
		} else {
			player.removeEffect(MinecraftEffectTypes.NightVision);
			player.removeEffect(MinecraftEffectTypes.Speed);
		}
	}
}
