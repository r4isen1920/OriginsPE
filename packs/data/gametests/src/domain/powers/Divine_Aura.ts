import { Player } from '@minecraft/server';
import { RegisterPower } from '../Registries';
import { Power } from '../Ability';
import { PlayerTick } from '../../core/Ticker';
import { PlayerState } from '../../core/PlayerState';
import { FlagService } from '../../services/FlagService';
import { Log } from '../../utils/Log';

/**
 * Divine_Aura: Players with this power have a divine aura.
 */

@RegisterPower
export class Divine_Aura implements Power {
	readonly id = 'divine_aura';
	private static readonly log = Log.get('Divine_Aura');

	@PlayerTick(10)
	static onPlayerTick(player: Player): void {
		try {
			const state = PlayerState.for(player);
			const isDiviner = state.getOrigin() === 'diviner';
			const hasLink = state.getFlag<string>('prescience_linked_id') !== undefined;

			FlagService.set(player, 'flag_a', isDiviner || hasLink);
		} catch (error: any) {
			Divine_Aura.log.error(
				`Error inside Divine Aura ticker handler: ${error?.stack ?? error}`
			);
		}
	}
}
