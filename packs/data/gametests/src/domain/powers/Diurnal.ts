import { Player, world, WeatherType, TicksPerSecond } from '@minecraft/server';
import { RegisterPower } from '../Registries';
import { Power } from '../Ability';
import { PlayerTick } from '../../core/Ticker';
import { PlayerState } from '../../core/PlayerState';
import { Log } from '../../utils/Log';

/**
 * Diurnal: Affects the player's abilities based on the time of day and weather conditions.
 */

@RegisterPower
export class Diurnal implements Power {
	readonly id = 'diurnal';
	private static readonly log = Log.get('Diurnal');

	constructor() {
		world.afterEvents.weatherChange.subscribe((event) => {
			try {
				const { dimension, newWeather } = event;
				const playersInDimension = world.getDimension(dimension).getPlayers();

				for (const player of playersInDimension) {
					const state = PlayerState.for(player);
					if (state.getOrigin() !== 'bee') continue;

					if (newWeather === WeatherType.Clear) {
						state.setFlag('diurnal_raining', false);
					} else {
						state.setFlag('diurnal_raining', true);
					}
				}
			} catch (error: any) {
				Diurnal.log.error(
					`Error inside weatherChange subscriber: ${error?.stack ?? error}`
				);
			}
		});
	}

	@PlayerTick(4)
	static onPlayerTick(player: Player): void {
		try {
			const state = PlayerState.for(player);
			if (state.getOrigin() !== 'bee') return;

			const time = world.getTimeOfDay();
			const isNightTime = time >= 12000 && time <= 22813;
			const isRaining = state.getFlag<boolean>('diurnal_raining') === true;

			if (isNightTime || isRaining) {
				player.addEffect('weakness', TicksPerSecond * 12, {
					amplifier: 1,
					showParticles: false
				});
				player.addEffect('slowness', TicksPerSecond * 12, {
					amplifier: 1,
					showParticles: false
				});
			} else {
				if (player.getEffect('weakness')) {
					player.removeEffect('weakness');
				}
				if (player.getEffect('slowness')) {
					player.removeEffect('slowness');
				}
			}
		} catch (error: any) {
			Diurnal.log.error(`Error inside Diurnal ticker handler: ${error?.stack ?? error}`);
		}
	}
}
