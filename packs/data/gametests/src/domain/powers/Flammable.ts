import {
	Player,
	EntityHurtAfterEvent,
	EntityDamageCause,
	system,
	EntityHealthComponent
} from '@minecraft/server';
import { Power } from '../Ability';
import { RegisterPower } from '../Registries';
import { PlayerState } from '../../core/PlayerState';
import { AfterEntityHurt } from '../../core/DecoratedEvents';

@RegisterPower
export class Flammable implements Power {
	readonly id = 'flammable';

	@AfterEntityHurt()
	static onPlayerHurt(ev: EntityHurtAfterEvent): void {
		const { hurtEntity: player, damage, damageSource } = ev;
		if (!(player instanceof Player) || !player.isValid) return;

		const cause = damageSource.cause;
		if (
			cause !== EntityDamageCause.fire &&
			cause !== EntityDamageCause.fireTick &&
			cause !== EntityDamageCause.lava
		)
			return;

		const state = PlayerState.for(player);
		if (!state || !state.hasPower('flammable')) return;

		system.run(() => {
			if (!player.isValid) return;

			const health = player.getComponent('minecraft:health') as EntityHealthComponent;
			if (health) {
				const targetHealth = Math.max(0, health.currentValue - damage);

				health.setCurrentValue(targetHealth);
			}
		});
	}
}
