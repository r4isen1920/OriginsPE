import { Player, EntityDamageCause, EntityHurtBeforeEvent } from '@minecraft/server';
import { Power } from '../Ability';
import { RegisterPower } from '../Registries';

@RegisterPower
export class OceansGift implements Power {
	readonly id = 'no_trident_damage';

	onHurtBefore(player: Player, ev: EntityHurtBeforeEvent): void {
		if (!player.isValid) return;

		const source = ev.damageSource;
		const attacker = source.damagingEntity;

		const isTridentProjectile =
			source.cause === EntityDamageCause.projectile &&
			source.damagingProjectile?.typeId === 'minecraft:thrown_trident';
		const isTridentMeleeCause = attacker?.typeId === 'minecraft:thrown_trident';

		if (!isTridentProjectile && !isTridentMeleeCause) {
			return;
		}

		ev.cancel = true;
	}
}
