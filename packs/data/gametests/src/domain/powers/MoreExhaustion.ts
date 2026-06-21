import { Player } from '@minecraft/server';
import { Power } from '../../core/abilities/Ability';
import { PlayerState } from '../../core/platform/PlayerState';
import { RegisterPower } from '../../core/abilities/Registries';
import { AttributeService } from '../../services/AttributeService';

@RegisterPower
export class MoreExhaustion implements Power {
	readonly id = 'more_exhaustion';

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
