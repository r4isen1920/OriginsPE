import {
	EntityDamageCause,
	Entity,
	EntityHurtAfterEvent,
	Player,
	TicksPerSecond} from '@minecraft/server';

import { Power } from '../../core/abilities/Ability';
import { RegisterPower } from '../../core/abilities/Registries';
import { PlayerState } from '../../core/platform/PlayerState';
import { MinecraftEffectTypes } from '@minecraft/vanilla-data';



@RegisterPower
export class StaticEnergy implements Power {
	readonly id = 'static_energy';

	private static readonly SLOWNESS_DURATION_TICKS = 2 * TicksPerSecond;
	private static readonly SLOWNESS_AMPLIFIER = 1;



	onDealDamage(_player: Player, event: EntityHurtAfterEvent): void {
		const victim = event.hurtEntity;
		const attacker = event.damageSource.damagingEntity;

		if (!attacker || !attacker.isValid || !victim.isValid) return;
		if (event.damageSource.cause !== EntityDamageCause.entityAttack) return;
		if (attacker.id === victim.id) return;

		StaticEnergy.applyStaticShock(victim, attacker);
	}

	private static applyStaticShock(target: Entity, source: Entity): void {
		if (!target.isValid) return;

		target.addEffect(MinecraftEffectTypes.Slowness, StaticEnergy.SLOWNESS_DURATION_TICKS, {
			amplifier: StaticEnergy.SLOWNESS_AMPLIFIER,
			showParticles: false
		});
	}
}
