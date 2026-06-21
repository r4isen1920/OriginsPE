import { Power } from '../../core/abilities/Ability';
import { RegisterPower } from '../../core/abilities/Registries';
import { Player, EntityHurtAfterEvent } from '@minecraft/server';

/**
 * Fatality: the holder deals 50% bonus damage to targets afflicted with fatal poison.
 */
@RegisterPower
export class Fatality implements Power {
	readonly id = 'poison_bonus_damage';
	readonly tickInterval = 1;

	onTick(player: Player): void {
		const target = player.getEntitiesFromViewDirection({ maxDistance: 4 })[0]?.entity;

		if (target) {
			const fatalPoison = target.getEffect('fatal_poison');
			if (fatalPoison) {
			}
		}
	}

	onDealDamage(player: Player, ev: EntityHurtAfterEvent): void {
		const target = ev.hurtEntity;

		const effect = target.getEffect('fatal_poison');
		if (effect) {
			const bonus = ev.damage * 0.5;
			target.applyDamage(bonus, {
				cause: ev.damageSource.cause,
				damagingEntity: player
			});
			player.playSound('random.orb');
		}
	}
}
