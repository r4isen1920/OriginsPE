import { Player, TicksPerSecond, EntityHitEntityAfterEvent, system } from '@minecraft/server';
import { RegisterPower } from '../Registries';
import { Power } from '../Ability';
import { PlayerState } from '../../core/PlayerState';
import { ResourceBarService } from '../../services/ResourceBarService';
import { Log } from '../../utils/Log';

/**
 * Stingers: the holder deals poison damage when attacking mid-air, with a
 * limited number of uses before needing to recharge on the ground.
 */

@RegisterPower
export class Stingers implements Power {
	readonly id = 'stingers';
	readonly tickInterval = 2;
	private static readonly log = Log.get('Stingers');

	private static readonly COOLDOWN_BAR_ID = 13;
	private static readonly COOLDOWN_KEY = 'stingers_cooldown';
	private static readonly COOLDOWN_TICKS = TicksPerSecond * 5;

	onAttack(player: Player, ev: EntityHitEntityAfterEvent): void {
		const hurtEntity = ev.hitEntity;
		if (!hurtEntity) return;

		if (player.isOnGround) return;

		const state = PlayerState.for(player);
		const now = system.currentTick;
		if (state.isOnCooldown(Stingers.COOLDOWN_KEY, now)) return;

		if (hurtEntity.getEffect('fatal_poison')?.duration ?? 0) {
			Stingers.log.debug(
				'Hurt entity already has fatal_poison active. Skipping to prevent stinger consumption.'
			);
			return;
		}

		state.setCooldown(Stingers.COOLDOWN_KEY, now, Stingers.COOLDOWN_TICKS);
		ResourceBarService.push(player, {
			id: Stingers.COOLDOWN_BAR_ID,
			durationSeconds: 5
		});

		hurtEntity.addEffect('fatal_poison', TicksPerSecond * 7, { amplifier: 0 });

		let stingers = state.getFlag<number>('bee_stingers_left');
		if (stingers === undefined) {
			stingers = 7;
			Stingers.log.info('Stingers flag was undefined. Initializing count to 7.');
		}

		stingers--;
		state.setFlag('bee_stingers_left', stingers);

		hurtEntity.dimension.spawnParticle(
			'r4isen1920_originspe:bee_poison_sting',
			hurtEntity.location
		);
		hurtEntity.dimension.playSound('enchant.thorns.hit', hurtEntity.location);

		if (stingers <= 0) {
			Stingers.log.warn(`Player ${player.name} hit 0 stingers. Executing kill script.`);
			player.sendMessage('§cYou have run out of stingers and perished!§r');
			player.kill();
			state.setFlag('bee_stingers_left', 7);
		}
	}

	onTick(player: Player): void {
		const state = PlayerState.for(player);
		if (state.getFlag<number>('bee_stingers_left') === undefined) {
			state.setFlag('bee_stingers_left', 7);
			Stingers.log.info(`Initialized stingers count to 7 for player: ${player.name}`);
		}
	}
}
