import { Player } from '@minecraft/server';
import { Power } from '../Ability';
import { PlayerState } from '../../core/PlayerState';
import { RegisterPower } from '../Registries';

@RegisterPower
export class Fast_metabolism implements Power {
	readonly id = 'fast_metabolism';

	readonly tickInterval = 3;

	onTick(player: Player): void {
		try {
			const state = PlayerState.for(player);

			if (state.getOrigin() !== 'kitsune') {
				if (state.getFlag<boolean>('exhaustion_applied') === true) {
					player.triggerEvent('r4isen1920_originspe:exhaustion.normal');
					state.setFlag('exhaustion_applied', false);
				}
				return;
			}

			if (state.getFlag<boolean>('exhaustion_applied') === true) return;

			player.triggerEvent('r4isen1920_originspe:exhaustion.shulk');
			state.setFlag('exhaustion_applied', true);
		} catch {}
	}
}
