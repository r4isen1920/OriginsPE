import { EntityDamageCause, EntityHurtAfterEvent, Player, world } from '@minecraft/server';

import { Power } from '../Ability';
import { RegisterPower } from '../Registries';
import { PlayerState } from '../../core/PlayerState';


/**
 * You deal more damage the more entities are nearby.
 */
@RegisterPower
export class BoastingFirepower implements Power {
    readonly id = 'boasting_firepower';

    private static handler: ((ev: EntityHurtAfterEvent) => void) | undefined;
    private static refCount = 0;

    onAcquire(_player: Player): void {
        BoastingFirepower.refCount++;
        if (BoastingFirepower.refCount === 1) {
            BoastingFirepower.handler = (ev) => BoastingFirepower.onEntityHurt(ev);
            world.afterEvents.entityHurt.subscribe(BoastingFirepower.handler);
        }
    }

    onRelease(_player: Player): void {
        BoastingFirepower.refCount = Math.max(0, BoastingFirepower.refCount - 1);
        if (BoastingFirepower.refCount === 0 && BoastingFirepower.handler) {
            world.afterEvents.entityHurt.unsubscribe(BoastingFirepower.handler);
            BoastingFirepower.handler = undefined;
        }
    }

    onTick(_player: Player): void {}

    private static onEntityHurt(ev: EntityHurtAfterEvent): void {
        const { damage, damageSource, hurtEntity } = ev;

        if (damageSource.cause !== EntityDamageCause.entityAttack) return;

        const attacker = damageSource.damagingEntity;
        if (attacker?.typeId !== 'minecraft:player') return;
        if (!PlayerState.for(attacker as Player).hasPower('increased_attack_per_entity')) return;

        const nearbyEntitiesCount = hurtEntity.dimension.getEntities({
            location: hurtEntity.location,
            maxDistance: 6,
            excludeFamilies: ['inanimate'],
        })?.length || 0;

        const additionalDamageMultiplier = nearbyEntitiesCount * 0.10;
        const appliedDamage = damage * additionalDamageMultiplier;
        if (appliedDamage > 1) hurtEntity.applyDamage(Math.round(appliedDamage));
    }
}