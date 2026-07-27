import { Player, system } from '@minecraft/server';

import { Power } from '../../core/abilities/Ability';
import { RegisterPower } from '../../core/abilities/Registries';
import { PlayerState } from '../../core/platform/PlayerState';
import { Log } from '../../utils/Log';
import { DivinerLink } from './DivinerLink';


/**
 * Intervention: active Diviner power. Swaps the Diviner and a linked player
 * across any dimension on a 120-second cooldown.
 */
@RegisterPower
export class Intervention implements Power {
	private static readonly log = Log.get('Intervention');

	readonly id = 'intervention';

	readonly active = {
		icon: '32',
		name: 'origins.trait.intervention.name',
	};

	onActivate(player: Player): void {
		const state = PlayerState.for(player);
		if (state.getOrigin() !== 'diviner') return;

		if (state.isOnCooldown('intervention', system.currentTick)) {
			player.playSound('note.bass', { volume: 1, pitch: 0.5 });
			return;
		}

		DivinerLink.openInterventionForm(player).catch((e) =>
			Intervention.log.error(`openInterventionForm failed for ${player.name}: ${e}`)
		);
	}
}
