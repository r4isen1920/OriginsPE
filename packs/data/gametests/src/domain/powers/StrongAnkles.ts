import { EntityDamageCause, Player, EntityHurtBeforeEvent } from '@minecraft/server';
import { RegisterPower } from '../Registries';
import { Power } from '../Ability';
import { PlayerState } from '../../core/PlayerState';
import { BeforeEntityHurt } from '../../core/DecoratedEvents';

@RegisterPower
export class StrongAnkles implements Power {
	readonly id = 'strong_ankles';

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
