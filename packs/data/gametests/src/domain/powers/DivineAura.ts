import { Player } from '@minecraft/server';
import { RegisterPower } from '../../core/abilities/Registries';
import { Power } from '../../core/abilities/Ability';
import { AttributeService } from '../../services/AttributeService';

/**
 * Divine_Aura: the holder permanently glows with a divine aura.
 */

@RegisterPower
export class DivineAura implements Power {
	readonly id = 'divine_aura';
	readonly tickInterval = 10;

	onRelease(player: Player): void {
		AttributeService.apply(player, { outlineType: 'none' });
	}

	onTick(player: Player): void {
		AttributeService.apply(player, { outlineType: 'divine_aura' });
	}
}
