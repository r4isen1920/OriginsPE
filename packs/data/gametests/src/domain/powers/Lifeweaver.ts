import { Player, world, system, TicksPerSecond } from '@minecraft/server';
import { RegisterPower } from '../Registries';
import { Power } from '../Ability';
import { PlayerState } from '../../core/PlayerState';
import { Log } from '../../utils/Log';

/**
 * Lifeweaver: Players with this power can absorb damage and convert it into healing.
 */

@RegisterPower
export class Lifeweaver implements Power {
	readonly id = 'lifeweaver';
	private static readonly log = Log.get('Lifeweaver');

	constructor() {
		world.afterEvents.entityHurt.subscribe((event) => {
			try {
				const { damage, hurtEntity } = event;

				if (!(hurtEntity instanceof Player)) return;

				const state = PlayerState.for(hurtEntity);
				if (state.getOrigin() !== 'elf') return;

				const currentTick = system.currentTick;

				if (state.isOnCooldown('lifeweaver_cooldown', currentTick)) return;

				let currentDamageWindow = state.getFlag<number>('lifeweaver_damage_window') ?? 0;
				currentDamageWindow += damage;
				state.setFlag('lifeweaver_damage_window', currentDamageWindow);

				if (state.getFlag<boolean>('lifeweaver_tracking') === true) return;

				state.setFlag('lifeweaver_tracking', true);

				system.runTimeout(() => {
					try {
						if (!hurtEntity.isValid) return;

						const totalDamage = state.getFlag<number>('lifeweaver_damage_window') ?? 0;

						state.setFlag('lifeweaver_damage_window', 0);
						state.setFlag('lifeweaver_tracking', false);

						if (totalDamage <= 0) return;

						const healthComp = hurtEntity.getComponent('health');
						if (healthComp) {
							const finalHealth = Math.min(
								healthComp.currentValue + totalDamage,
								healthComp.effectiveMax
							);
							healthComp.setCurrentValue(finalHealth);
						}

						const amp = Math.floor(totalDamage * 0.2);
						hurtEntity.addEffect('absorption', TicksPerSecond * 12, {
							amplifier: Math.max(0, amp),
							showParticles: true
						});

						try {
							hurtEntity.dimension.spawnParticle('r4isen1920_originspe:elven_heal', {
								x: hurtEntity.location.x,
								y: hurtEntity.location.y + 1,
								z: hurtEntity.location.z
							});
							hurtEntity.dimension.playSound('ender_eye.dead', hurtEntity.location, {
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
			} catch (error: any) {
				Lifeweaver.log.error(
					`Error inside Lifeweaver damage listener: ${error?.stack ?? error}`
				);
			}
		});
	}
}
