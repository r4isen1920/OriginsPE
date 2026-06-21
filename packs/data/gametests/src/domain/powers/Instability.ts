import { Player } from '@minecraft/server';
import { RegisterPower } from '../../core/abilities/Registries';
import { Power } from '../../core/abilities/Ability';
import { PlayerState } from '../../core/platform/PlayerState';
import { AttributeService } from '../../services/AttributeService';

/**
 * Instability: Players with this power have unstable health levels.
 */

@RegisterPower
export class Instability implements Power {
	readonly id = 'instability';
	readonly tickInterval = 20;

	onRelease(player: Player): void {
		const state = PlayerState.for(player);
		state.setFlag('instability_last_level', undefined);
		AttributeService.apply(player, { health: 20 });
	}

	onTick(player: Player): void {
		const state = PlayerState.for(player);

		const activeEffects = player
			.getEffects()
			.filter((effect) => effect.typeId !== 'health_boost').length;

		const targetMaxHealth = Math.max(20 - activeEffects * 2, 2);

		const lastLevel = state.getFlag<number>('instability_last_level') ?? 20;
		if (lastLevel === targetMaxHealth) return;

		state.setFlag('instability_last_level', targetMaxHealth);
		AttributeService.apply(player, { health: targetMaxHealth });
	}
}
