import { Player } from '@minecraft/server';
import { RegisterPower } from '../Registries';
import { Power } from '../Ability';
import { PlayerTick } from '../../core/Ticker';
import { PlayerState } from '../../core/PlayerState';
import { Log } from '../../utils/Log';

/**
 * Swift: Players with this power have increased movement speed.
 */

@RegisterPower
export class Swift implements Power {
	readonly id = 'swift';
	private static readonly log = Log.get('Swift');

	@PlayerTick(5)
	static onPlayerTick(player: Player): void {
		try {
			const state = PlayerState.for(player);
			if (state.getOrigin() !== 'elf') return;

			player.triggerEvent('r4isen1920_originspe:movement.0.15');
		} catch (error: any) {
			Swift.log.error(`Error inside Swift movement modifier: ${error?.stack ?? error}`);
		}
	}
}
