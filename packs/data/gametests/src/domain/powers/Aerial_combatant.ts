import { Player } from '@minecraft/server';
import { RegisterPower } from '../Registries';
import { Power } from '../Ability';
import { PlayerTick } from '../../core/Ticker';
import { PlayerState } from '../../core/PlayerState';
import { Log } from '../../utils/Log';

/**
 * Aerial Combatant is a passive power that grants Elytrians increased attack damage while gliding.
 */

@RegisterPower
export class Aerial_combatant implements Power {
	readonly id = 'aerial_combatant';
	private static readonly log = Log.get('Aerial_combatant');

	@PlayerTick(2)
	static onPlayerTick(player: Player): void {
		try {
			const state = PlayerState.for(player);
			if (state.getOrigin() !== 'elytrian') return;

			if (player.isGliding) {
				player.triggerEvent('r4isen1920_originspe:attack.10');
			} else {
				player.triggerEvent('r4isen1920_originspe:attack.1');
			}
		} catch (error: any) {
			Aerial_combatant.log.error(
				`Error inside Aerial Combatant tick handler: ${error?.stack ?? error}`
			);
		}
	}
}
