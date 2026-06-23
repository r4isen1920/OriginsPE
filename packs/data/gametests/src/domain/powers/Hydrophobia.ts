import { Player, EntityDamageCause, WeatherType, BlockRaycastOptions } from '@minecraft/server';
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

	private static readonly MAX_SHELTER_DISTANCE = 256;

	@AfterWeatherChange()
	static onWeatherChange(ev: any): void {
		isRaining = ev.newWeather === WeatherType.Rain || ev.newWeather === WeatherType.Thunder;
	}

	private isExposedToSky(player: Player): boolean {
		const raycastOptions: BlockRaycastOptions = {
			maxDistance: Hydrophobia.MAX_SHELTER_DISTANCE,
			includePassableBlocks: false,
			includeLiquidBlocks: false
		};

		const headPos = {
			x: player.location.x,
			y: player.location.y + player.getHeadLocation().y - player.location.y,
			z: player.location.z
		};

		const rayHit = player.dimension.getBlockFromRay(
			headPos,
			{ x: 0, y: 1, z: 0 },
			raycastOptions
		);

		return rayHit === undefined;
	}

	onTick(player: Player): void {
		const exposedToRain = isRaining && this.isExposedToSky(player);

		if (player.isSwimming || player.isInWater || exposedToRain) {
			player.applyDamage(1, { cause: EntityDamageCause.drowning });
		}
	}
}
