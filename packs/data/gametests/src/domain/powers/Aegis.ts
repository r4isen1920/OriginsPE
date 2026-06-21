import { Player, EntityDamageCause, EntityHurtAfterEvent } from '@minecraft/server';
import { RegisterPower } from '../../core/abilities/Registries';
import { Power } from '../../core/abilities/Ability';
import { PlayerState } from '../../core/platform/PlayerState';

/**
 * Aegis: the holder deflects half of the damage dealt to them back at the attacker.
 */

@RegisterPower
export class Aegis implements Power {
	readonly id = 'aegis';

	onHurt(player: Player, ev: EntityHurtAfterEvent): void {
		const { damage, damageSource } = ev;

		const damagingEntity = damageSource.damagingEntity;
		if (!damagingEntity) return;

		if (damagingEntity instanceof Player) {
			const attackerState = PlayerState.for(damagingEntity);
			if (attackerState.hasPower('aegis')) return;

			const linkedId = attackerState.getFlag<string>('prescience_linked_id');
			if (linkedId === player.id) return;
		}

		damagingEntity.applyDamage(Math.floor(damage * 0.5), {
			cause: EntityDamageCause.override,
			damagingEntity: player
		});
	}
}
