import { Player, EntityHurtBeforeEvent } from '@minecraft/server';
import { RegisterPower } from '../../core/abilities/Registries';
import { Power } from '../../core/abilities/Ability';

/**
 * Fragility: the holder takes increased damage when their health is low.
 */

@RegisterPower
export class Fragility implements Power {
	readonly id = 'fragility';

	onHurtBefore(player: Player, ev: EntityHurtBeforeEvent): void {
		const healthComponent = player.getComponent('health');
		if (!healthComponent) return;

		const effectiveMax = healthComponent.effectiveMax || 20;
		const healthPercentage =
			50 - Math.floor((healthComponent.currentValue / effectiveMax) * 50);

		if (healthPercentage <= 0) return;

		ev.damage = ev.damage * (1 + healthPercentage / 100);
	}
}
