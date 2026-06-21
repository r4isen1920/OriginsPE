import { EntityDamageCause, EntityHurtAfterEvent, Player, world } from '@minecraft/server';

import { Power } from '../Ability';
import { RegisterPower } from '../Registries';
import { PlayerState } from '../../core/PlayerState';
import { AfterEntityHurt } from '../../core/DecoratedEvents';


/**
 * You deal more damage the more entities are nearby.
 */
@RegisterPower
export class BoastingFirepower implements Power {
    readonly id = 'increased_attack_per_entity';

    private static handler: ((ev: EntityHurtAfterEvent) => void) | undefined;
    private static refCount = 0;

    @AfterEntityHurt
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