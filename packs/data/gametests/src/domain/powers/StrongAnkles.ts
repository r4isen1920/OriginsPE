import { EntityDamageCause, Player, EntityHurtBeforeEvent } from '@minecraft/server';
import { RegisterPower } from '../../core/abilities/Registries';
import { Power } from '../../core/abilities/Ability';
import { PlayerState } from '../../core/platform/PlayerState';
import { BeforeEntityHurt } from '../../core/platform/DecoratedEvents';

@RegisterPower
export class StrongAnkles implements Power {
	readonly id = 'fall_immunity';

	@BeforeEntityHurt
	static onEntityHurt(event: EntityHurtBeforeEvent): void {
		const { damageSource, hurtEntity } = event;

		if (!(hurtEntity instanceof Player)) return;

		const state = PlayerState.for(hurtEntity);
		if (state.getOrigin() !== 'feline' && state.getOrigin() !== 'kitsune') return;

		if (damageSource.cause === EntityDamageCause.fall) {
			event.cancel = true;
		}
	}
}
