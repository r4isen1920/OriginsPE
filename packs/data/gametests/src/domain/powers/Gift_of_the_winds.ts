import { Player, system, TicksPerSecond } from '@minecraft/server';
import { RegisterPower } from '../Registries';
import { Power } from '../Ability';
import { PlayerState } from '../../core/PlayerState';

/**
 * Gift of the Winds is an active power that allows the holder to launch themselves
 * into the air by sneaking and jumping simultaneously. It has a cooldown of 30
 * seconds. Loose: dispatched to whoever is granted the power.
 */

@RegisterPower
export class GiftOfTheWinds implements Power {
	readonly id = 'gift_of_the_winds';
	readonly tickInterval = 2;

	onTick(player: Player): void {
		const state = PlayerState.for(player);

		if (!player.isSneaking || !player.isJumping) return;

		const currentTick = system.currentTick;

		if (!state.isOnCooldown('gift_of_the_winds_cooldown', currentTick)) {
			const isHeavy = state.getFlag<boolean>('is_heavy') === true;
			const launchForce = isHeavy ? 1.5 : 3.0;

			player.applyImpulse({ x: 0, y: launchForce, z: 0 });

			player.addEffect('slow_falling', TicksPerSecond * 3, {
				amplifier: 255,
				showParticles: false
			});

			try {
				player.dimension.playSound('firework.launch', player.location, {
					volume: 1.0,
					pitch: 1.25
				});
				player.dimension.spawnParticle('r4isen1920_originspe:air_burst', {
					x: player.location.x,
					y: player.location.y + 1,
					z: player.location.z
				});
			} catch {}

			state.setCooldown('gift_of_the_winds_cooldown', currentTick, 600);
			state.setFlag('gift_of_the_winds_expiry', currentTick + 600);
		} else {
			try {
				player.playSound('note.bass', { volume: 1.0, pitch: 1.5 });

				const expiryTick =
					state.getFlag<number>('gift_of_the_winds_expiry') ?? currentTick + 600;
				const ticksLeft = expiryTick - currentTick;

				if (ticksLeft > 0) {
					const secondsLeft = (ticksLeft / 20).toFixed(1);
					player.sendMessage(
						`§c[Debug] Gift of the Winds is on cooldown! §e${secondsLeft}s §cleft.`
					);
				}
			} catch {}
		}
	}
}
