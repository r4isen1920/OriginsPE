import { EntityDamageCause, EntityHurtAfterEvent, Player, world } from '@minecraft/server';

import { Power } from '../Ability';
import { RegisterPower } from '../Registries';
import { PlayerState } from '../../core/PlayerState';


/**
 * You deal more damage the more entities are nearby.
 */
@RegisterPower
export class Boasting_firepower implements Power {
    readonly id = 'boasting_firepower';

    private static handler: ((ev: EntityHurtAfterEvent) => void) | undefined;
    private static refCount = 0;

    onAcquire(_player: Player): void {
        Boasting_firepower.refCount++;
        if (Boasting_firepower.refCount === 1) {
            Boasting_firepower.handler = (ev) => Boasting_firepower.onEntityHurt(ev);
            world.afterEvents.entityHurt.subscribe(Boasting_firepower.handler);
        }
    }

    onRelease(_player: Player): void {
        Boasting_firepower.refCount = Math.max(0, Boasting_firepower.refCount - 1);
        if (Boasting_firepower.refCount === 0 && Boasting_firepower.handler) {
            world.afterEvents.entityHurt.unsubscribe(Boasting_firepower.handler);
            Boasting_firepower.handler = undefined;
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