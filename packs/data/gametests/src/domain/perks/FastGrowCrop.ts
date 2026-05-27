import {
    BlockPermutation,
    Player,
    PlayerPlaceBlockAfterEvent,
    system,
    world,
} from '@minecraft/server';

import { Perk } from '../Ability';
import { RegisterPerk } from '../Registries';
import { PlayerState } from '../../core/PlayerState';


interface CropType {
    typeId: string;
    maxGrowth: number;
}

const CROP_TYPES: CropType[] = [
    { typeId: 'wheat',        maxGrowth: 7 },
    { typeId: 'beetroot',     maxGrowth: 7 },
    { typeId: 'carrots',      maxGrowth: 7 },
    { typeId: 'potatoes',     maxGrowth: 7 },
    { typeId: 'melon_stem',   maxGrowth: 7 },
    { typeId: 'pumpkin_stem', maxGrowth: 7 },
    { typeId: 'sweet_berry_bush', maxGrowth: 3 },
    { typeId: 'nether_wart',      maxGrowth: 3 },
];


/**
 * When planting crops, there is a chance it will immediately grow.
 */
@RegisterPerk
export class FastGrowCrop implements Perk {
    readonly id = 'fast_grow_crop';

    private static handler: ((ev: PlayerPlaceBlockAfterEvent) => void) | undefined;
    private static refCount = 0;

    onAcquire(_player: Player): void {
        FastGrowCrop.refCount++;
        if (FastGrowCrop.refCount === 1) {
            FastGrowCrop.handler = (ev) => FastGrowCrop.onPlaceBlock(ev);
            world.afterEvents.playerPlaceBlock.subscribe(FastGrowCrop.handler);
        }
    }

    onRelease(_player: Player): void {
        FastGrowCrop.refCount = Math.max(0, FastGrowCrop.refCount - 1);
        if (FastGrowCrop.refCount === 0 && FastGrowCrop.handler) {
            world.afterEvents.playerPlaceBlock.unsubscribe(FastGrowCrop.handler);
            FastGrowCrop.handler = undefined;
        }
    }

    onTick(_player: Player): void {}

    private static onPlaceBlock(ev: PlayerPlaceBlockAfterEvent): void {
        const { block, player } = ev;

        if (!PlayerState.for(player).hasPerk('fast_grow_crop')) return;

        const crop = CROP_TYPES.find(c => block.permutation.matches(`minecraft:${c.typeId}`));
        if (!crop) return;

        if (Math.random() < 0.8) return;

        const { x, y, z } = block.location;
        const dimension = block.dimension;

        system.runTimeout(() => {
            const placedBlock = dimension.getBlock({ x, y, z });
            if (!placedBlock) return;
            if (!placedBlock.permutation.matches(`minecraft:${crop.typeId}`)) return;

            const currentGrowth = (placedBlock.permutation.getState('growth') as number) || 0;
            const newGrowth = Math.min(
                1 + Math.floor(currentGrowth + (Math.random() * (crop.maxGrowth - 1))),
                crop.maxGrowth,
            );

            placedBlock.setPermutation(
                BlockPermutation.resolve(`minecraft:${crop.typeId}`, { growth: newGrowth })
            );

            dimension.spawnParticle('r4isen1920_originspe:experience_touch', placedBlock.center());
            player.playSound('random.orb', { volume: 0.25, pitch: 1.75 });
        }, 1);
    }
}