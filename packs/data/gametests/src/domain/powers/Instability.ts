import { Player } from '@minecraft/server';
import { RegisterPower } from '../Registries';
import { Power } from '../Ability';
import { PlayerTick } from '../../core/Ticker';
import { PlayerState } from '../../core/PlayerState';
import { Log } from '../../utils/Log';

/**
 * Instability: Players with this power have unstable health levels.
 */

@RegisterPower
export class Instability implements Power {
	readonly id = 'instability';
	private static readonly log = Log.get('Instability');

	@PlayerTick(20)
	static onPlayerTick(player: Player): void {
		try {
			const state = PlayerState.for(player);
			if (state.getOrigin() !== 'diviner') return;

			const activeEffects = player
				.getEffects()
				.filter((effect) => effect.typeId !== 'health_boost').length;

			const targetMaxHealth = Math.max(20 - activeEffects * 2, 2);

			const lastLevel = state.getFlag<number>('instability_last_level') ?? 20;
			if (lastLevel === targetMaxHealth) return;

			state.setFlag('instability_last_level', targetMaxHealth);
			player.triggerEvent(`r4isen1920_originspe:health.${targetMaxHealth}`);
		} catch (error: any) {
			Instability.log.error(
				`Error inside Instability ticker handler: ${error?.stack ?? error}`
			);
		}
	}
}
