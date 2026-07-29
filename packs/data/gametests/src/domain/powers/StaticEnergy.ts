import { EntityDamageCause, Entity, EntityHurtAfterEvent, Player, TicksPerSecond } from '@minecraft/server';
import { Power } from '../../core/abilities/Ability';
import { RegisterPower } from '../../core/abilities/Registries';
import { PlayerState } from '../../core/platform/PlayerState';
import { AfterEntityHurt } from '../../core/platform/DecoratedEvents';

const SLOWNESS_DURATION_TICKS = TicksPerSecond * 6;
const SLOWNESS_AMPLIFIER = 1;

@RegisterPower
export class StaticEnergy implements Power {
    readonly id = 'static_energy';

    @AfterEntityHurt
    static onEntityHurt(event: EntityHurtAfterEvent): void {
        const victim = event.hurtEntity;
        const attacker = event.damageSource.damagingEntity;

        if (!attacker || !attacker.isValid || !victim.isValid) return;
        if (event.damageSource.cause !== EntityDamageCause.entityAttack) return;
        if (attacker.id === victim.id) return;

        if (attacker instanceof Player && PlayerState.for(attacker).hasPower('static_energy')) {
            StaticEnergy.applyStaticShock(victim, attacker);
        }

        if (victim instanceof Player && PlayerState.for(victim).hasPower('static_energy')) {
            StaticEnergy.applyStaticShock(attacker, victim);
        }
    }

    private static applyStaticShock(target: Entity, source: Entity): void {
        if (!target.isValid) return;

        target.addEffect('slowness', SLOWNESS_DURATION_TICKS, {
            amplifier: SLOWNESS_AMPLIFIER,
            showParticles: false,
        });

        source.dimension.playSound('random.zap', target.location, {
            volume: 0.3,
            pitch: 1.2,
        });
    }
}