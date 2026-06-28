import {
    EntityDieAfterEvent,
    Player,
} from '@minecraft/server';

import { Perk } from '../../core/abilities/Ability';
import { RegisterPerk } from '../../core/abilities/Registries';
import { PlayerState } from '../../core/platform/PlayerState';
import { AfterEntityDie } from '../../core';


const DOUBLE_LOOT_CHANCE = 50;


/**
 * Animals you kill have a chance to drop double loot.
 */
@RegisterPerk
export class MoreAnimalLoot implements Perk {
    readonly id = 'more_animal_loot';

    @AfterEntityDie
    private static onEntityDie(ev: EntityDieAfterEvent): void {
        const { damageSource, deadEntity } = ev;
        const entity = damageSource.damagingEntity;

        if (entity?.typeId !== 'minecraft:player') return;
        if (!PlayerState.for(entity as Player).hasPerk('more_animal_loot')) return;
        if (!deadEntity.matches({ families: ['mob'] })) return;
        if (deadEntity.getComponent('is_baby')) return;
        if (Math.random() * 100 >= DOUBLE_LOOT_CHANCE) return;

        deadEntity.runCommand('loot spawn ~~0.5~ kill @s');
        deadEntity.dimension.runCommand(`playsound random.orb @a[x=${deadEntity.location.x},y=${deadEntity.location.y},z=${deadEntity.location.z},r=16] ${deadEntity.location.x} ${deadEntity.location.y} ${deadEntity.location.z} 1 1.75`);
        deadEntity.dimension.spawnParticle('r4isen1920_originspe:experience_touch', deadEntity.location);
    }
}