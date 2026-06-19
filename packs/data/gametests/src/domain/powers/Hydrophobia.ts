import { Player, EntityDamageCause, WeatherType } from '@minecraft/server';
import { RegisterPower } from '../Registries';
import { Power } from '../Ability';
import { AfterWeatherChange } from '../../core/DecoratedEvents';

/**
 * Hydrophobia: this power takes damage when swimming or submerged in water.
 * When it rains, Enderians also take damage.
 */

let isRaining = false;

@RegisterPower
export class Hydrophobia implements Power {
	readonly id = 'water_vulnerability';
	readonly tickInterval = 10;

	@AfterWeatherChange()
	static onWeatherChange(ev: any): void {
		isRaining = ev.newWeather === WeatherType.Rain || ev.newWeather === WeatherType.Thunder;
	}

	onTick(player: Player): void {
		if (player.isSwimming || player.isInWater || isRaining) {
			player.applyDamage(1, { cause: EntityDamageCause.drowning });
		}
	}
}
