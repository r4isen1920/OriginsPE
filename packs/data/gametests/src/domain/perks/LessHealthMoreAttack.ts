import { Player, TicksPerSecond } from '@minecraft/server';
import { Perk } from '../../core/abilities/Ability';
import { RegisterPerk } from '../../core/abilities/Registries';

/**
 * Warrior signature perk: trades max health for higher base attack. Both
 * values are applied via the data-driven attribute layer.
 */
@RegisterPerk
export class LessHealthMoreAttack implements Perk {
	readonly id = 'less_health_more_attack';
	readonly tickInterval = 10;

	onTick(player: Player): void {
		const component = player.getComponent('health');
		if (!component) return;

		const ratio = component.currentValue / component.effectiveMax;

		if (ratio > 0.5) {
			player.removeEffect('strength');
			return;
		}

		const amplifier = ratio <= 0.25 ? 1 : 0;

		player.addEffect('strength', TicksPerSecond * 15, {
			amplifier,
			showParticles: false
		});
	}
}
