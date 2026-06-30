import { Player, system } from '@minecraft/server';
import { RegisterPower } from '../../core/abilities/Registries';
import { Power } from '../../core/abilities/Ability';

const BAT_PARTICLE = 'r4isen1920_originspe:vampire_aura';
const SOUND_INTERVAL_TICKS = 80;

@RegisterPower
export class VampireAura implements Power {
	readonly id = 'vampire_aura';
	readonly tickInterval = 5;

	onTick(player: Player): void {
		if (!player.isValid) return;

		const loc = {
			x: player.location.x,
			y: player.location.y + 1.0,
			z: player.location.z
		};

		player.dimension.spawnParticle(BAT_PARTICLE, loc);

		if (system.currentTick % SOUND_INTERVAL_TICKS === 0) {
			player.dimension.playSound('random.vampire', loc, { volume: 0.5, pitch: 1.0 });
		}
	}
}
