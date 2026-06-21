import { Player } from '@minecraft/server';
import { RegisterPower } from '../../core/abilities/Registries';
import { Power } from '../../core/abilities/Ability';
import { AttributeService } from '../../services/AttributeService';

/**
 * Aerial Combatant is a passive power that grants increased attack damage while
 * gliding. Dispatched centrally to whoever is granted the power, so it is loose
 * and can be attached to any origin.
 */

@RegisterPower
export class AerialCombatant implements Power {
	readonly id = 'aerial_combatant';
	readonly tickInterval = 2;

	onRelease(player: Player): void {
		AttributeService.apply(player, { attack: 1 });
	}

	onTick(player: Player): void {
		if (player.isGliding) {
			AttributeService.apply(player, { attack: 10 });
		} else {
			AttributeService.apply(player, { attack: 1 });
		}
	}
}
