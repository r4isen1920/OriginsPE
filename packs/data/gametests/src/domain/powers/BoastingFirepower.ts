import { EntityDamageCause, EntityHurtAfterEvent, Player } from '@minecraft/server';

import { Power } from '../../core/abilities/Ability';
import { RegisterPower } from '../../core/abilities/Registries';


/**
 * You deal more damage the more entities are nearby.
 */
@RegisterPower
export class BoastingFirepower implements Power {
    readonly id = 'increased_attack_per_entity';

    onDealDamage(_player: Player, ev: EntityHurtAfterEvent): void {
        const { damage, damageSource, hurtEntity } = ev;

        if (damageSource.cause !== EntityDamageCause.entityAttack) return;

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