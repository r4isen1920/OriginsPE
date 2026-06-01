import { Player, TicksPerSecond } from '@minecraft/server';
import { RegisterPower } from '../Registries';
import { Power } from '../Ability';
import { PlayerTick } from '../../core/Ticker';
import { PlayerState } from '../../core/PlayerState';
import { EntityUtils } from '../../utils/EntityUtils';
import { Log } from '../../utils/Log';

@RegisterPower
export class Noctural implements Power {
	readonly id = 'noctural';
	private static readonly log = Log.get('Noctural');

	@PlayerTick(3)
	static onPlayerTick(player: Player): void {
		try {
			const state = PlayerState.for(player);
			if (state.getOrigin() !== 'feline') return;

			const lightLevel = EntityUtils.getLightLevel(player);

			if (lightLevel < 8) {
				player.addEffect('night_vision', TicksPerSecond * 12, { showParticles: false });
				player.addEffect('strength', TicksPerSecond * 12, {
					amplifier: 0,
					showParticles: false
				});
			} else {
				player.removeEffect('night_vision');
				player.removeEffect('strength');
			}
		} catch (error: any) {
			Noctural.log.error(`Error inside Noctural tick handler: ${error?.stack ?? error}`);
		}
	}
}
