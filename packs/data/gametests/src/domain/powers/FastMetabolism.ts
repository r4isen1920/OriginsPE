import { Player } from '@minecraft/server';
import { Power } from '../Ability';
import { PlayerState } from '../../core/PlayerState';
import { RegisterPower } from '../Registries';
import { AttributeService } from '../../services/AttributeService';

@RegisterPower
export class FastMetabolism implements Power {
	readonly id = 'fast_metabolism';

	readonly tickInterval = 3;

	onRelease(player: Player): void {
		const state = PlayerState.for(player);
		if (state.getFlag<boolean>('exhaustion_applied') === true) {
			AttributeService.apply(player, { exhaustion: 'normal' });
			state.setFlag('exhaustion_applied', false);
		}
	}

	onTick(player: Player): void {
		const state = PlayerState.for(player);

		if (state.getFlag<boolean>('exhaustion_applied') === true) return;

		AttributeService.apply(player, { exhaustion: 'shulk' });
		state.setFlag('exhaustion_applied', true);
	}
}
