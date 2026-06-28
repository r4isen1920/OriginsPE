import { EntityDamageCause, Player, world, system } from '@minecraft/server';
import { Power } from '../../core/abilities/Ability';
import { RegisterPower } from '../../core/abilities/Registries';
import { PlayerState } from '../../core/platform/PlayerState';

const RETALIATION_DAMAGE = 2; // 1 full heart
const KNOCKBACK_STRENGTH = 0.5;
const RECOIL_COOLDOWN_TICKS = 10; // 0.5 seconds

const attackerCooldowns = new Map<string, number>();

world.afterEvents.entityHurt.subscribe((event) => {
    const victim = event.hurtEntity;
    const attacker = event.damageSource.damagingEntity;

    if (!(victim instanceof Player) || !attacker || !attacker.isValid) return;
    if (event.damageSource.cause !== EntityDamageCause.entityAttack) return;

    if (!PlayerState.for(victim).hasPower('static_field')) return;

    const now = system.currentTick;
    const nextValidHit = attackerCooldowns.get(attacker.id) ?? 0;
    if (now < nextValidHit) return;

    attackerCooldowns.set(attacker.id, now + RECOIL_COOLDOWN_TICKS);

    attacker.applyDamage(RETALIATION_DAMAGE, {
        cause: EntityDamageCause.contact,
        damagingEntity: victim
    });

    const vLoc = victim.location;
    const aLoc = attacker.location;
    let dirX = aLoc.x - vLoc.x;
    let dirZ = aLoc.z - vLoc.z;

    const len = Math.sqrt(dirX * dirX + dirZ * dirZ);
    if (len > 0) {
        dirX /= len;
        dirZ /= len;
    } else {
        dirX = Math.random() - 0.5;
        dirZ = Math.random() - 0.5;
    }

    attacker.applyImpulse({
        x: dirX * KNOCKBACK_STRENGTH,
        y: 0.3,
        z: dirZ * KNOCKBACK_STRENGTH
    });

    victim.dimension.spawnParticle(
        'r4isen1920_originspe:electric_zap', 
        { x: aLoc.x, y: aLoc.y + 0.8, z: aLoc.z }
    );

    victim.playSound('random.zap', {
        location: aLoc,
        volume: 0.3,
        pitch: 1.2
    });
});

@RegisterPower
export class StaticField implements Power {
    readonly id = 'static_field';
}