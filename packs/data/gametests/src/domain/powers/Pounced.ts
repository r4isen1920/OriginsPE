import { Player, system, TicksPerSecond } from '@minecraft/server';
import { Power } from '../Ability';
import { PlayerState } from '../../core/PlayerState';
import { RegisterPower } from '../Registries';
import { ResourceBarService } from '../../services/ResourceBarService';

@RegisterPower
export class Pounced implements Power {
	readonly id = 'pounce';
	readonly icon = '06';

	private static readonly COOLDOWN_BAR_ID = 6;
	private static readonly COOLDOWN_KEY = 'pounce';
	private static readonly COOLDOWN_TICKS = TicksPerSecond * 5;
	private static readonly MAX_CHARGE = 10;

	readonly tickInterval = 2;

	onTick(player: Player): void {
		const state = PlayerState.for(player);
		const now = system.currentTick;

		const isCharging = player.isSneaking && player.isJumping;
		const currentCharge = state.getFlag<number>('pounce_hold_tick') ?? 0;

		if (state.isOnCooldown(Pounced.COOLDOWN_KEY, now)) {
			state.setFlag('pounce_hold_tick', 0);
			state.setFlag('pounce_charging', false);
			return;
		}

		if (isCharging) {
			const nextCharge = Math.min(currentCharge + 1, Pounced.MAX_CHARGE);
			state.setFlag('pounce_hold_tick', nextCharge);
			state.setFlag('pounce_charging', true);

			const chargePercent = Math.floor((nextCharge / Pounced.MAX_CHARGE) * 100);
			player.onScreenDisplay.setActionBar(`§6Charging Pounce: §e${chargePercent}%`);
		} else {
			if (state.getFlag<boolean>('pounce_charging') === true) {
				state.setFlag('pounce_charging', false);

				if (currentCharge > 0) {
					const viewDir = player.getViewDirection();
					const launchForce = currentCharge / 4;

					player.applyKnockback({ x: viewDir.x, z: viewDir.z }, launchForce);
					player.applyImpulse({ x: 0, y: launchForce * 0.4, z: 0 });

					player.dimension.playSound('firework.launch', player.location, {
						volume: 1.0,
						pitch: 1.0
					});

					state.setFlag('pounce_launched', true);
				}
				state.setFlag('pounce_hold_tick', 0);
			}
		}

		if (state.getFlag<boolean>('pounce_launched') === true && player.isOnGround) {
			state.setFlag('pounce_launched', false);
			state.setCooldown(Pounced.COOLDOWN_KEY, now, Pounced.COOLDOWN_TICKS);

			ResourceBarService.push(player, {
				id: Pounced.COOLDOWN_BAR_ID,
				durationSeconds: 5
			});

			player.dimension.playSound('random.explode', player.location, {
				volume: 0.6,
				pitch: 1.5
			});
			player.dimension.spawnParticle('r4isen1920_originspe:air_burst', {
				x: player.location.x,
				y: player.location.y + 0.5,
				z: player.location.z
			});

			const targets = player.dimension.getEntities({
				location: player.location,
				maxDistance: 4,
				excludeFamilies: ['inanimate']
			});

			for (const entity of targets) {
				if (entity.id === player.id) continue;

				entity.runCommand(`damage @s 6 entity_attack attack @p`);
			}
		}
	}
}
