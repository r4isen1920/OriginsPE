import { Player, system, TicksPerSecond, EntityHurtAfterEvent } from '@minecraft/server';
import { RegisterPower } from '../Registries';
import { Power } from '../Ability';
import { PlayerState } from '../../core/PlayerState';
import { ResourceBarService } from '../../services/ResourceBarService';
import { Log } from '../../utils/Log';

@RegisterPower
export class Lifeweaver implements Power {
	readonly id = 'lifeweaver';
	readonly icon = '16';

	private static readonly COOLDOWN_BAR_ID = 16;
	private static readonly COOLDOWN_KEY = 'lifeweaver_cooldown';
	private static readonly COOLDOWN_TICKS = TicksPerSecond * 2;
	private static readonly ABSORPTION_DURATION = TicksPerSecond * 12;
	private static readonly log = Log.get('Lifeweaver');

	onHurt(player: Player, ev: EntityHurtAfterEvent): void {
		const { damage } = ev;
		if (damage <= 0) return;

		const state = PlayerState.for(player);
		const now = system.currentTick;

		if (state.isOnCooldown(Lifeweaver.COOLDOWN_KEY, now)) return;

		const healthComp = player.getComponent('health');
		if (healthComp) {
			const restored = damage / 2;
			const finalHealth = Math.min(
				healthComp.currentValue + restored,
				healthComp.effectiveMax
			);
			healthComp.setCurrentValue(finalHealth);
		}

		const amplifier = Math.max(0, Math.floor(damage / 4));
		player.addEffect('absorption', Lifeweaver.ABSORPTION_DURATION, {
			amplifier,
			showParticles: true
		});

		player.dimension.spawnParticle('r4isen1920_originspe:elven_heal', {
			x: player.location.x,
			y: player.location.y + 1,
			z: player.location.z
		});
		player.dimension.playSound('ender_eye.dead', player.location, {
			volume: 2.0,
			pitch: 1.25
		});

		state.setCooldown(Lifeweaver.COOLDOWN_KEY, now, Lifeweaver.COOLDOWN_TICKS);
		ResourceBarService.push(player, {
			id: Lifeweaver.COOLDOWN_BAR_ID,
			durationSeconds: 2
		});
	}
}
