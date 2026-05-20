import { Player, world, EntityDamageCause } from '@minecraft/server';
import { RegisterPower } from '../Registries';
import { Power } from '../Ability';
import { PlayerState } from '../../core/PlayerState';
import { Log } from '../../utils/Log';

/**
 * Aegis: Players with this power can deflect damage from other players.
 */

@RegisterPower
export class Aegis implements Power {
	readonly id = 'aegis';
	private static readonly log = Log.get('Aegis');

	constructor() {
		world.afterEvents.entityHurt.subscribe((event) => {
			try {
				const { damage, damageSource, hurtEntity } = event;

				if (!(hurtEntity instanceof Player)) return;

				const state = PlayerState.for(hurtEntity);
				if (state.getOrigin() !== 'diviner') return;

				const damagingEntity = damageSource.damagingEntity;
				if (!damagingEntity) return;

				if (damagingEntity instanceof Player) {
					const attackerState = PlayerState.for(damagingEntity);
					if (attackerState.getOrigin() === 'diviner') return;

					const linkedId = attackerState.getFlag<string>('prescience_linked_id');
					if (linkedId === hurtEntity.id) return;
				}

				damagingEntity.applyDamage(Math.floor(damage * 0.5), {
					cause: EntityDamageCause.override,
					damagingEntity: hurtEntity
				});
			} catch (error: any) {
				Aegis.log.error(`Error inside Aegis deflection listener: ${error?.stack ?? error}`);
			}
		});
	}
}
