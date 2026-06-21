import { Player, world, system, EntityDamageCause } from '@minecraft/server';
import { RegisterPower } from '../../core/abilities/Registries';
import { Power } from '../../core/abilities/Ability';
import { PlayerState } from '../../core/platform/PlayerState';
import { AfterEntityHealthChanged } from '../../core/platform/DecoratedEvents';
/**
 * Oracle: Players with this power are linked to another player (via Prescience).
 * When either the Oracle or the linked player takes damage or is healed for 2 or more health,
 * the other player receives the same effect.
 */
@RegisterPower
export class Oracle implements Power {
	readonly id = 'oracle';

	@AfterEntityHealthChanged
	static onEntityHealthChanged(event: any): void {
		const { entity, newValue, oldValue } = event;

		if (!(entity instanceof Player)) return;

		const state = PlayerState.for(entity);
		if (state.getOrigin() !== 'diviner') return;

		const linkedId = state.getFlag<string>('prescience_linked_id');
		if (!linkedId) return;

		const healthDiff = Math.floor(newValue - oldValue);
		if (Math.abs(healthDiff) < 2) return;

		for (const player of world.getAllPlayers()) {
			if (!player.isValid || player.id === entity.id) continue;

			const pState = PlayerState.for(player);
			if (pState.getFlag<string>('prescience_linked_id') === linkedId) {
				if (pState.getOrigin() === 'diviner') continue;

				const playerHealth = player.getComponent('health');
				if (!playerHealth) continue;

				if (healthDiff < 0) {
					const damageValue = Math.abs(healthDiff);

					system.run(() => {
						if (!player.isValid) return;

						player.applyDamage(damageValue, {
							cause: EntityDamageCause.override,
							damagingEntity: entity
						});
					});
				} else {
					const finalHealth = Math.min(
						playerHealth.currentValue + healthDiff,
						playerHealth.effectiveMax
					);

					system.run(() => {
						if (player.isValid) {
							playerHealth.setCurrentValue(finalHealth);
						}
					});
				}
			}
		}
	}
}
