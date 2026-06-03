import { Player, system, TicksPerSecond, EntityHurtAfterEvent } from '@minecraft/server';
import { RegisterPower } from '../Registries';
import { Power } from '../Ability';
import { PlayerState } from '../../core/PlayerState';
import { Log } from '../../utils/Log';

@RegisterPower
export class Lifeweaver implements Power {
	readonly id = 'lifeweaver';
	readonly tickInterval = 1;

	private static readonly log = Log.get('Lifeweaver');

	onHurt(player: Player, ev: EntityHurtAfterEvent): void {
		const { damage } = ev;
		const state = PlayerState.for(player);
		const currentTick = system.currentTick;

		if (state.isOnCooldown('lifeweaver_cooldown', currentTick)) return;

		let currentDamageWindow = state.getFlag<number>('lifeweaver_damage_window') ?? 0;
		currentDamageWindow += damage;
		state.setFlag('lifeweaver_damage_window', currentDamageWindow);

		if (state.getFlag<boolean>('lifeweaver_tracking') === true) return;

		state.setFlag('lifeweaver_tracking', true);
		state.setFlag('lifeweaver_timer', currentTick + TicksPerSecond * 3);
	}

	onTick(player: Player): void {
		if (!player.isValid) return;

		const state = PlayerState.for(player);
		if (state.getFlag<boolean>('lifeweaver_tracking') !== true) return;

		const currentTick = system.currentTick;
		const targetTick = state.getFlag<number>('lifeweaver_timer') ?? 0;

		if (currentTick < targetTick) return;

		const totalDamage = state.getFlag<number>('lifeweaver_damage_window') ?? 0;

		state.setFlag('lifeweaver_damage_window', 0);
		state.setFlag('lifeweaver_tracking', false);
		state.setFlag('lifeweaver_timer', 0);

		if (totalDamage <= 0) return;

		const healthComp = player.getComponent('health');
		if (healthComp) {
			const finalHealth = Math.min(
				healthComp.currentValue + totalDamage,
				healthComp.effectiveMax
			);
			healthComp.setCurrentValue(finalHealth);
		}

		const amp = Math.floor(totalDamage * 0.2);
		player.addEffect('absorption', TicksPerSecond * 12, {
			amplifier: Math.max(0, amp),
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

		state.setCooldown('lifeweaver_cooldown', currentTick, 600);
	}
}
