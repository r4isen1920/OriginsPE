import { Player, system, TicksPerSecond, EntityHurtAfterEvent } from '@minecraft/server';
import { RegisterPower } from '../Registries';
import { Power } from '../Ability';
import { PlayerState } from '../../core/PlayerState';
import { Log } from '../../utils/Log';

/**
 * Lifeweaver: the holder absorbs damage taken over a short window and converts
 * it into healing and absorption.
 */

@RegisterPower
export class Lifeweaver implements Power {
	readonly id = 'lifeweaver';
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

		system.runTimeout(() => {
			try {
				if (!player.isValid) return;

				const totalDamage = state.getFlag<number>('lifeweaver_damage_window') ?? 0;

				state.setFlag('lifeweaver_damage_window', 0);
				state.setFlag('lifeweaver_tracking', false);

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

				try {
					player.dimension.spawnParticle('r4isen1920_originspe:elven_heal', {
						x: player.location.x,
						y: player.location.y + 1,
						z: player.location.z
					});
					player.dimension.playSound('ender_eye.dead', player.location, {
						volume: 2.0,
						pitch: 1.25
					});
				} catch {}

				state.setCooldown('lifeweaver_cooldown', system.currentTick, 600);
			} catch (innerError: any) {
				Lifeweaver.log.error(
					`Error executing Lifeweaver release: ${innerError?.stack ?? innerError}`
				);
			}
		}, TicksPerSecond * 3);
	}
}
