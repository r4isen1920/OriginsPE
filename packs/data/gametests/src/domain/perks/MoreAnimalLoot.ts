import {
    EntityDieAfterEvent,
    Player,
    world,
} from '@minecraft/server';

import { Perk } from '../Ability';
import { RegisterPerk } from '../Registries';
import { PlayerState } from '../../core/PlayerState';


const DOUBLE_LOOT_CHANCE = 50;


/**
 * Animals you kill have a chance to drop double loot.
 */
@RegisterPerk
export class MoreAnimalLoot implements Perk {
    readonly id = 'more_animal_loot';

    private static handler: ((ev: EntityDieAfterEvent) => void) | undefined;
    private static refCount = 0;

    onAcquire(_player: Player): void {
        MoreAnimalLoot.refCount++;
        if (MoreAnimalLoot.refCount === 1) {
            MoreAnimalLoot.handler = (ev) => MoreAnimalLoot.onEntityDie(ev);
            world.afterEvents.entityDie.subscribe(MoreAnimalLoot.handler);
        }
    }

    onRelease(_player: Player): void {
        MoreAnimalLoot.refCount = Math.max(0, MoreAnimalLoot.refCount - 1);
        if (MoreAnimalLoot.refCount === 0 && MoreAnimalLoot.handler) {
            world.afterEvents.entityDie.unsubscribe(MoreAnimalLoot.handler);
            MoreAnimalLoot.handler = undefined;
        }
    }

    onTick(_player: Player): void {}

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