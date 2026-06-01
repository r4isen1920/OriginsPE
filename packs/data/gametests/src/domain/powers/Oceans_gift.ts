import { Player, EntityDamageCause, EntityHurtBeforeEvent } from '@minecraft/server';
import { Power } from '../Ability';
import { RegisterPower } from '../Registries';

@RegisterPower
export class Oceans_gift implements Power {
	readonly id = 'oceans_gift';

	onHurtBefore(player: Player, ev: EntityHurtBeforeEvent): void {
		try {
			if (
				ev.damageSource.cause !== EntityDamageCause.projectile ||
				ev.damageSource.damagingProjectile?.typeId !== 'minecraft:thrown_trident'
			)
				return;

			ev.damage = 0;
			player.dimension.spawnParticle('r4isen1920_originspe:bubbles', player.location);
			player.dimension.playSound('ui.enchant', player.location, { pitch: 1.5 });
		} catch {}
	}
}
