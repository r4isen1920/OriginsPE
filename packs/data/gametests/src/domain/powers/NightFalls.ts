import { RegisterPower } from '../../core/abilities/Registries';
import { Power } from '../../core/abilities/Ability';
import { Player, world } from '@minecraft/server';
import { MinecraftEffectTypes } from '@minecraft/vanilla-data';

const EFFECT_DURATION_TICKS = 8;

/** When night falls, Crimson Tracker gains 20% damage reduction (Resistance I) and +1 attack speed (Haste I). */
@RegisterPower
export class NightFalls implements Power {
	readonly id = 'night_falls';
	readonly tickInterval = 4;

	onRelease(player: Player): void {
		player.removeEffect(MinecraftEffectTypes.Resistance);
		player.removeEffect(MinecraftEffectTypes.Haste);
	}

	onTick(player: Player): void {
		if (!player.isValid) return;

		if (player.dimension.id !== 'minecraft:overworld') {
			player.removeEffect(MinecraftEffectTypes.Resistance);
			player.removeEffect(MinecraftEffectTypes.Haste);
			return;
		}

		const time = world.getTimeOfDay();
		const isNight = time >= 12000 && time <= 23999;

		if (!isNight) {
			player.removeEffect(MinecraftEffectTypes.Resistance);
			player.removeEffect(MinecraftEffectTypes.Haste);
			return;
		}

		player.addEffect(MinecraftEffectTypes.Resistance, EFFECT_DURATION_TICKS, {
			amplifier: 0,
			showParticles: false
		});
		player.addEffect(MinecraftEffectTypes.Haste, EFFECT_DURATION_TICKS, {
			amplifier: 0,
			showParticles: false
		});
	}
}
