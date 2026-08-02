import { Player } from '@minecraft/server';
import { RegisterPower } from '../../core/abilities/Registries';
import { Power } from '../../core/abilities/Ability';
import { AttributeSourceInstance } from '../../services/AttributeService';

/**
 * Aerial Combatant is a passive power that grants increased attack damage while
 * gliding. Dispatched centrally to whoever is granted the power, so it is loose
 * and can be attached to any origin.
 */

@RegisterPower
export class AerialCombatant implements Power {
	readonly id = 'aerial_combatant';
	readonly tickInterval = 2;

	onTick(player: Player, attributes: AttributeSourceInstance): void {
		if (player.isGliding) {
			attributes.set({ attack: { add: 9 } });
		} else {
			attributes.clear();
		}
	}
}
