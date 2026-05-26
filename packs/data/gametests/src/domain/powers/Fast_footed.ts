import { Player } from '@minecraft/server';
import { RegisterPower } from '../Registries';
import { Power } from '../Ability';
import { PlayerTick } from '../../core/Ticker';
import { PlayerState } from '../../core/PlayerState';
import { Log } from '../../utils/Log';

@RegisterPower
export class Fast_footed implements Power {
	readonly id = 'fast_footed';
	private static readonly log = Log.get('Fast_footed');

	@PlayerTick(3)
	static onPlayerTick(player: Player): void {
		try {
			const state = PlayerState.for(player);
			const isKitsune = state.getOrigin() === 'kitsune';
			const wasScaleApplied = state.getFlag<boolean>('scale_set') === true;

			if (!isKitsune) {
				if (wasScaleApplied) {
					try {
						player.triggerEvent('r4isen1920_originspe:movement.normal');
						player.triggerEvent('r4isen1920_originspe:scale.normal');
					} catch {}
					state.setFlag('scale_set', false);
				}
				return;
			}

			if (wasScaleApplied) return;

			player.triggerEvent('r4isen1920_originspe:movement.0.1425');
			player.triggerEvent('r4isen1920_originspe:scale.0.75');
			state.setFlag('scale_set', true);
		} catch (error: any) {
			Fast_footed.log.error(
				`Error inside Fast_footed tick handler: ${error?.stack ?? error}`
			);
		}
	}
}
