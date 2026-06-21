import {
	Player,
	world,
	WeatherType,
	TicksPerSecond,
	WeatherChangeAfterEvent
} from '@minecraft/server';
import { RegisterPower } from '../Registries';
import { Power } from '../Ability';
import { PlayerState } from '../../core/PlayerState';
import { AfterWeatherChange } from '../../core/DecoratedEvents';

/**
 * Diurnal: Affects the player's abilities based on the time of day and weather conditions.
 */
@RegisterPower
export class Diurnal implements Power {
	readonly id = 'nighttime';
	readonly tickInterval = 4;

	@AfterWeatherChange
	static onWeatherChange(event: WeatherChangeAfterEvent): void {
		const { dimension, newWeather } = event;
		const playersInDimension = world.getDimension(dimension).getPlayers();

		for (const player of playersInDimension) {
			if (!player.isValid) continue;

			const state = PlayerState.for(player);
			if (state.getOrigin() !== 'bee') continue;

			if (newWeather === WeatherType.Clear) {
				state.setFlag('diurnal_raining', false);
			} else {
				state.setFlag('diurnal_raining', true);
			}
		}
	}

	onTick(player: Player): void {
		if (!player.isValid) return;

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
	}
}
