import { AttributeOverrides } from '../../services/Attributes';
import { Perk } from '../Ability';
import { RegisterPerk } from '../Registries';
import { Player } from '@minecraft/server';
import { AttributeService } from '../../services/AttributeService';

/**
 * Warrior signature perk: trades max health for higher base attack. Both
 * values are applied via the data-driven attribute layer.
 */
@RegisterPerk
export class LessHealthMoreAttack implements Perk {
	readonly id = 'less_health_more_attack';
	readonly tickInterval = 10;
	readonly attributes: AttributeOverrides = {
		health: 16,
		attack: 2
	};

	onTick(player: Player): void {
		const component = player.getComponent('health');
		if (!component) return;

		const current = component.currentValue;
		const max = component.effectiveMax;

		const missingRatio = 1 - current / max;

		const attack = 2 + Math.round(missingRatio * 6);
		AttributeService.apply(player, { attack });
	}
}
