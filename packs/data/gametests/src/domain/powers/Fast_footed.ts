import { Player } from '@minecraft/server';
import { RegisterPower } from '../Registries';
import { Power } from '../Ability';
import { PlayerState } from '../../core/PlayerState';
import { AttributeService } from '../../services/AttributeService';

@RegisterPower
export class Fast_footed implements Power {
	readonly id = 'fast_footed';
	readonly tickInterval = 3;

	onRelease(player: Player): void {
		const state = PlayerState.for(player);
		if (state.getFlag<boolean>('scale_set') === true) {
			AttributeService.apply(player, { movement: 0.1, scale: 1 });
			state.setFlag('scale_set', false);
		}
	}

	onTick(player: Player): void {
		const state = PlayerState.for(player);
		const wasScaleApplied = state.getFlag<boolean>('scale_set') === true;

		if (wasScaleApplied) return;

		AttributeService.apply(player, { movement: 0.1425, scale: 0.75 });
		state.setFlag('scale_set', true);
	}
}
