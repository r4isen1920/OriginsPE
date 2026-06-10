import { Player } from '@minecraft/server';
import { RegisterPower } from '../Registries';
import { Power } from '../Ability';
import { PlayerState } from '../../core/PlayerState';

@RegisterPower
export class FamiliarFace implements Power {
	readonly id = 'familiar_face';
	readonly tickInterval = 1;

	onTick(player: Player): void {
		if (!player.isValid) return;

		const state = PlayerState.for(player);

		if (state.getOrigin() !== 'enderian') {
			player.triggerEvent('r4isen1920_originspe:family_type.player');
			return;
		}

		player.triggerEvent('r4isen1920_originspe:family_type.enderman');
	}
}
