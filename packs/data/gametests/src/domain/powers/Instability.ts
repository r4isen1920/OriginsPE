import { Player } from '@minecraft/server';

import { Power } from '../../core/abilities/Ability';
import { RegisterPower } from '../../core/abilities/Registries';
import { PlayerState } from '../../core/platform/PlayerState';
import { AttributeService } from '../../services/AttributeService';
import { DivinerLink } from './DivinerLink';


/**
 * Instability: passive Diviner power. Each unique status effect lowers the
 * holder's base max health by 1, down to a floor of 1. This base is what
 * Prescience's shared pool is layered on top of.
 */
@RegisterPower
export class Instability implements Power {
	readonly id = 'instability';
	readonly tickInterval = 20;

	onRelease(player: Player): void {
		PlayerState.for(player).setFlag('instability_last_level', undefined);
		AttributeService.apply(player, { health: 20 });
	}

	onTick(player: Player): void {
		// While the player is in an active Prescience pool, DivinerLink owns their max
		// health (base + shared bonus), so skip the standalone apply here.
		if (DivinerLink.isPooledParticipant(player)) return;

		const state = PlayerState.for(player);
		const target = Math.max(1, 20 - DivinerLink.uniqueEffectCount(player));

		if (state.getFlag<number>('instability_last_level') === target) return;
		state.setFlag('instability_last_level', target);
		AttributeService.apply(player, { health: target });
	}
}
