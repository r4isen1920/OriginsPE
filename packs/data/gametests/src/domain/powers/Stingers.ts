import { Player, world, TicksPerSecond } from '@minecraft/server';
import { RegisterPower } from '../Registries';
import { Power } from '../Ability';
import { PlayerTick } from '../../core/Ticker';
import { PlayerState } from '../../core/PlayerState';
import { Log } from '../../utils/Log';

/**
 * Stingers: Causes the player to deal poison damage to enemies when attacking mid-air, 
 * with a limited number of uses before needing to recharge on the ground.
 */

@RegisterPower
export class Stingers implements Power {
	readonly id = 'stingers';
	private static readonly log = Log.get('Stingers');

	constructor() {
		Stingers.log.info('Stingers power constructor evaluated. Registering event listeners.');

		world.afterEvents.entityHurt.subscribe((event) => {
			try {
				const { damageSource, hurtEntity } = event;
				const attacker = damageSource.damagingEntity;

				if (!attacker) return;

				Stingers.log.debug(
					`entityHurt event detected. Attacker typeId: ${attacker.typeId}, HurtEntity typeId: ${hurtEntity.typeId}`
				);

				if (!(attacker instanceof Player)) {
					Stingers.log.debug('Attacker is not an instance of Player. Skipping.');
					return;
				}

				if (hurtEntity.getEffect('fatal_poison')?.duration ?? 0) {
					Stingers.log.debug(
						'Hurt entity already has fatal_poison active. Skipping to prevent stinger consumption.'
					);
					return;
				}

				const state = PlayerState.for(attacker);
				const currentOrigin = state.getOrigin();
				Stingers.log.debug(`Attacker origin check: ${currentOrigin}`);

				if (currentOrigin !== 'bee') return;

				Stingers.log.debug(`Attacker isOnGround state: ${attacker.isOnGround}`);
				if (!attacker.isOnGround) {
					Stingers.log.info(
						`Valid mid-air sting attack executed by player: ${attacker.name}`
					);

					hurtEntity.addEffect('fatal_poison', TicksPerSecond * 7, { amplifier: 0 });

					let stingers = state.getFlag<number>('bee_stingers_left');
					Stingers.log.debug(`Retrieved stingers flag count: ${stingers}`);

					if (stingers === undefined) {
						stingers = 7;
						Stingers.log.info('Stingers flag was undefined. Initializing count to 7.');
					}

					stingers--;
					state.setFlag('bee_stingers_left', stingers);
					Stingers.log.info(
						`Stinger consumed. Remaining for ${attacker.name}: ${stingers}`
					);

					attacker.sendMessage(`§eYou used a stinger! ${stingers} remaining.§r`);

					try {
						hurtEntity.dimension.spawnParticle(
							'r4isen1920_originspe:bee_poison_sting',
							hurtEntity.location
						);
						hurtEntity.dimension.playSound('enchant.thorns.hit', hurtEntity.location);
					} catch (visualError: any) {
						Stingers.log.error(
							`Failed to play particle or sound asset: ${visualError?.message ?? visualError}`
						);
					}

					if (stingers <= 0) {
						Stingers.log.warn(
							`Player ${attacker.name} hit 0 stingers. Executing kill script.`
						);
						attacker.sendMessage('§cYou have run out of stingers and perished!§r');
						attacker.kill();
						state.setFlag('bee_stingers_left', 7);
					}
				}
			} catch (error: any) {
				Stingers.log.error(
					`Critical error inside entityHurt subscriber: ${error?.stack ?? error}`
				);
			}
		});
	}

	@PlayerTick(2)
	static onPlayerTick(player: Player): void {
		try {
			const state = PlayerState.for(player);
			if (state.getOrigin() !== 'bee') return;

			let stingers = state.getFlag<number>('bee_stingers_left');
			if (stingers === undefined) {
				stingers = 7;
				state.setFlag('bee_stingers_left', stingers);
				Stingers.log.info(
					`Initialized stingers count to 7 inside Ticker stream for player: ${player.name}`
				);
			}
		} catch (tickerError: any) {
			Stingers.log.error(
				`Error inside processing onPlayerTick stream: ${tickerError?.message ?? tickerError}`
			);
		}
	}
}
