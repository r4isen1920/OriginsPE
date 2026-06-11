import { Player, EntityDamageCause } from '@minecraft/server';
import { Power } from '../Ability';
import { RegisterPower } from '../Registries';
import { PlayerState } from '../../core/PlayerState';
import { AfterEntityHitEntity, BeforeEntityHurt } from '../../core/DecoratedEvents';

const SLOW_DURATION = 60;
const SLOW_AMPLIFIER = 1;
const DAMAGE_REDUCTION = 0.9;

@RegisterPower
export class Sticky implements Power {
	readonly id = 'sticky';

	@AfterEntityHitEntity
	static onEntityHitEntity(event: any): void {
		if (!event) return;
		const { damagingEntity, hitEntity } = event;

		if (!(hitEntity instanceof Player)) return;
		if (!hitEntity?.isValid) return;

		const state = PlayerState.for(hitEntity);
		if (!state || !state.hasPower('sticky')) return;

		const fragmentationLevel = state.getFlag<number>('fragmentation_level') ?? 0;
		const duration = fragmentationLevel > 0 ? fragmentationLevel * 2 : SLOW_DURATION;
		const amplifier = fragmentationLevel > 0 ? fragmentationLevel - 1 : SLOW_AMPLIFIER;

		damagingEntity.addEffect('slowness', duration, { amplifier, showParticles: false });
		damagingEntity.dimension.playSound('hit.slime', hitEntity.location);
	}

	@BeforeEntityHurt
	static onEntityHurt(event: any): void {
		if (!event) return;
		const { hurtEntity, cause } = event;

		if (cause !== EntityDamageCause.entityAttack) return;
		if (!(hurtEntity instanceof Player)) return;
		if (!hurtEntity?.isValid) return;

		const state = PlayerState.for(hurtEntity);
		if (!state || !state.hasPower('sticky')) return;

		event.damage = event.damage * DAMAGE_REDUCTION;
	}
}
