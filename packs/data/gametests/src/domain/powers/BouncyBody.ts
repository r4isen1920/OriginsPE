import { Player, EntityDamageCause } from '@minecraft/server';
import { RegisterPower } from '../../core/abilities/Registries';
import { Power } from '../../core/abilities/Ability';
import { PlayerState } from '../../core/platform/PlayerState';
import { BeforeEntityHurt } from '../../core/platform/DecoratedEvents';
import { type AttributeOverrides } from '../../services';

const FALL_DAMAGE_MULTIPLIER = 0.25;

@RegisterPower
export class BouncyBody implements Power {
	readonly id = 'bouncy_body';
	readonly attributes: AttributeOverrides = {
		skinType: 'slimy',
	};

	@BeforeEntityHurt
	static onEntityHurt(event: any): void {
		if (!event) return;
		const { hurtEntity, cause } = event;

		if (cause !== EntityDamageCause.fall) return;
		if (!(hurtEntity instanceof Player)) return;
		if (!hurtEntity?.isValid) return;

		const state = PlayerState.for(hurtEntity);
		if (!state || !state.hasPower('bouncy_body')) return;

		event.damage = event.damage * FALL_DAMAGE_MULTIPLIER;
	}
}
