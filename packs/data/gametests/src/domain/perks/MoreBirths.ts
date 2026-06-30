import {
    EntitySpawnAfterEvent,
    Player,
} from '@minecraft/server';

import { Perk } from '../../core/abilities/Ability';
import { RegisterPerk } from '../../core/abilities/Registries';
import { PlayerState } from '../../core/platform/PlayerState';
import { AfterEntitySpawn } from '../../core';


/** Chance (0-100) for an additional baby to spawn when a rancher is nearby. */
const TWIN_BIRTH_CHANCE = 100;


/**
 * Animals bred when you are around have a chance to produce multiple babies.
 */
@RegisterPerk
export class MoreBirths implements Perk {
    readonly id = 'twin_breeding';

    @AfterEntitySpawn
    private static onEntitySpawn(ev: EntitySpawnAfterEvent): void {
        const { entity, cause } = ev;

        // Only care about entities spawned via breeding
        if (cause !== 'Born') return;
        if (entity.hasTag('_perk_twin_breeding')) return;

        try {
            const hasRancherNearby = entity.dimension.getEntities({
                location: entity.location,
                maxDistance: 12,
                type: 'minecraft:player',
            }).some(e => PlayerState.for(e as Player).hasPerk('twin_breeding'));

            if (!hasRancherNearby) return;
            if (Math.random() * 100 >= TWIN_BIRTH_CHANCE) return;

            const additionalBirth = entity.dimension.spawnEntity(
                entity.typeId,
                entity.location,
            );
            additionalBirth.addTag('_perk_twin_breeding');
            additionalBirth.runCommand('event entity @s minecraft:entity_born');

            entity.dimension.runCommand(`playsound random.orb @a[x=${entity.location.x},y=${entity.location.y},z=${entity.location.z},r=16] ${entity.location.x} ${entity.location.y} ${entity.location.z} 1 1.75`);
            entity.dimension.spawnParticle('r4isen1920_originspe:experience_touch', entity.location);
        } catch {}
    }
}