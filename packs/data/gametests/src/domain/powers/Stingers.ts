import { Player, TicksPerSecond, EntityHitEntityAfterEvent, system } from '@minecraft/server';
import { RegisterPower } from '../../core/abilities/Registries';
import { Power } from '../../core/abilities/Ability';
import { PlayerState } from '../../core/platform/PlayerState';
import { ResourceBarService } from '../../services/ResourceBarService';

/**
 * Stingers: the holder deals poison damage when attacking mid-air, with a
 * limited number of uses before needing to recharge on the ground.
 */

@RegisterPower
export class Stingers implements Power {
	readonly id = 'sacrifice_stinger';
	readonly icon = '13';
	readonly tickInterval = 2;

	private static readonly BAR_ID = 13;
	private static readonly BAR_SLOT = 2;
	private static readonly COOLDOWN_KEY = 'stingers_cooldown';
	private static readonly COOLDOWN_TICKS = TicksPerSecond * 5;
	private static readonly MAX_STINGERS = 7;

	private static stingerPercent(count: number): number {
		return Math.round((Math.max(0, count) / Stingers.MAX_STINGERS) * 100);
	}

	static pushStingerBar(player: Player, stingers: number): void {
		const pct = Stingers.stingerPercent(stingers);
		ResourceBarService.push(player, {
			id: Stingers.BAR_ID,
			slot: Stingers.BAR_SLOT,
			from: pct,
			to: pct,
			durationSeconds: 999,
			persist: true
		});
	}

	onAcquire(player: Player): void {
		const state = PlayerState.for(player);
		if (state.getFlag<number>('bee_stingers_left') === undefined) {
			state.setFlag('bee_stingers_left', Stingers.MAX_STINGERS);
		}
		const stingers = state.getFlag<number>('bee_stingers_left') ?? Stingers.MAX_STINGERS;
		Stingers.pushStingerBar(player, stingers);
	}

	onRelease(player: Player): void {
		ResourceBarService.pop(player, Stingers.BAR_ID);
	}

	onAttack(player: Player, ev: EntityHitEntityAfterEvent): void {
		const hurtEntity = ev.hitEntity;
		if (!hurtEntity) return;

		if (player.isOnGround) return;

		const state = PlayerState.for(player);
		const now = system.currentTick;
		if (state.isOnCooldown(Stingers.COOLDOWN_KEY, now)) return;

		if (hurtEntity.getEffect('fatal_poison')?.duration ?? 0) {
			return;
		}

		let stingers = state.getFlag<number>('bee_stingers_left') ?? Stingers.MAX_STINGERS;
		stingers--;
		state.setFlag('bee_stingers_left', stingers);
		Stingers.pushStingerBar(player, stingers);

		state.setCooldown(Stingers.COOLDOWN_KEY, now, Stingers.COOLDOWN_TICKS);

		hurtEntity.addEffect('fatal_poison', TicksPerSecond * 7, { amplifier: 0 });

		hurtEntity.dimension.spawnParticle(
			'r4isen1920_originspe:bee_poison_sting',
			hurtEntity.location
		);
		hurtEntity.dimension.playSound('enchant.thorns.hit', hurtEntity.location);

		if (stingers <= 0) {
			player.kill();
			state.setFlag('bee_stingers_left', Stingers.MAX_STINGERS);
			Stingers.pushStingerBar(player, Stingers.MAX_STINGERS);
		}
	}

	onTick(player: Player): void {
		const state = PlayerState.for(player);
		let stingers = state.getFlag<number>('bee_stingers_left');
		if (stingers === undefined) {
			stingers = Stingers.MAX_STINGERS;
			state.setFlag('bee_stingers_left', stingers);
			Stingers.pushStingerBar(player, stingers);
		}
	}
}
