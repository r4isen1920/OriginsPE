import { Player, system, TicksPerSecond } from '@minecraft/server';

import { Power } from '../Ability';
import { PlayerState } from '../../core/PlayerState';
import { RegisterPower } from '../Registries';
import { ResourceBarService } from '../../services/ResourceBarService';


/**
 * Slimecican high-jump: holding jump while not sneaking applies jump_boost; the
 * landing impact spawns a knockback ring and starts a 5s cooldown bar.
 */
@RegisterPower
export class HighJump implements Power {
	readonly id = 'high_jump';

	private static readonly COOLDOWN_BAR_ID = 7;
	private static readonly COOLDOWN_KEY = 'high_jump';
	private static readonly COOLDOWN_TICKS = TicksPerSecond * 5;

	readonly tickInterval = 2;

	onTick(player: Player): void {
		const state = PlayerState.for(player);
		const now = system.currentTick;
		if (state.isOnCooldown(HighJump.COOLDOWN_KEY, now)) return;

		const fragLevel = Number(state.getFlag<number>('fragmentation_level') ?? 0);

		if (!player.isSneaking) {
			player.addEffect('jump_boost', TicksPerSecond * 3, { amplifier: fragLevel * 2 });
			if (player.isJumping && state.getFlag<boolean>('high_jump_launched') !== true) {
				state.setFlag('high_jump_launched', true);
				player.dimension.playSound('mob.slime.big', player.location, { volume: 1, pitch: 1 });
			}
		} else {
			player.removeEffect('jump_boost');
		}

		if (state.getFlag<boolean>('high_jump_launched') === true && player.isOnGround) {
			state.setFlag('high_jump_launched', false);
			state.setCooldown(HighJump.COOLDOWN_KEY, now, HighJump.COOLDOWN_TICKS);
			ResourceBarService.push(player, {
				id: HighJump.COOLDOWN_BAR_ID,
				durationSeconds: 5,
			});
			player.dimension.playSound('mob.slime.big', player.location);
			try {
				player.dimension.spawnEntity(
					`r4isen1920_originspe:knockback_roar<r4isen1920_originspe:knockback_targets.${fragLevel}>`,
					player.location,
				);
			} catch {}
		}
	}
}
