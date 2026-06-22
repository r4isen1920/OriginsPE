import { Player, EntityDamageCause, WeatherType } from '@minecraft/server';
import { RegisterPower } from '../../core/abilities/Registries';
import { Power } from '../../core/abilities/Ability';
import { AfterWeatherChange } from '../../core/platform/DecoratedEvents';

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

	private isExposedToSky(player: Player): boolean {
		const { x, y, z } = player.location;
		const topmostBlock = player.dimension.getTopmostBlock({ x, z });

		if (topmostBlock === undefined) return true;

		return y >= topmostBlock.y;
	}

	onTick(player: Player): void {
		const exposedToRain = isRaining && this.isExposedToSky(player);

		if (player.isSwimming || player.isInWater || exposedToRain) {
			player.applyDamage(1, { cause: EntityDamageCause.drowning });
		}
	}
}
