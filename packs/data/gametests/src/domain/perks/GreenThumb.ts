import {
    BlockPermutation,
    Direction,
    Player,
    PlayerBreakBlockAfterEvent,
    world,
} from '@minecraft/server';

import { Perk } from '../Ability';
import { RegisterPerk } from '../Registries';
import { PlayerState } from '../../core/PlayerState';
import { LOG_BLOCKS } from './TreeCapitator';


const SAPLING_MAP: Record<string, string> = {
    'acacia_log':   'acacia_sapling',
    'birch_log':    'birch_sapling',
    'cherry_log':   'cherry_sapling',
    'dark_oak_log': 'dark_oak_sapling',
    'jungle_log':   'jungle_sapling',
    'mangrove_log': 'mangrove_propagule',
    'oak_log':      'oak_sapling',
    'spruce_log':   'spruce_sapling',
};


/**
 * When chopping a tree, there is a chance a sapling will automatically be replanted.
 */
@RegisterPerk
export class GreenThumb implements Perk {
    readonly id = 'green_thumb';

    private static handler: ((ev: PlayerBreakBlockAfterEvent) => void) | undefined;
    private static refCount = 0;

    onAcquire(_player: Player): void {
        GreenThumb.refCount++;
        if (GreenThumb.refCount === 1) {
            GreenThumb.handler = (ev) => GreenThumb.onBlockBreak(ev);
            world.afterEvents.playerBreakBlock.subscribe(GreenThumb.handler);
        }
    }

    onRelease(_player: Player): void {
        GreenThumb.refCount = Math.max(0, GreenThumb.refCount - 1);
        if (GreenThumb.refCount === 0 && GreenThumb.handler) {
            world.afterEvents.playerBreakBlock.unsubscribe(GreenThumb.handler);
            GreenThumb.handler = undefined;
        }
    }

    onTick(_player: Player): void {}

    private static onBlockBreak(ev: PlayerBreakBlockAfterEvent): void {
        const { block, brokenBlockPermutation, player } = ev;

        if (!PlayerState.for(player).hasPerk('green_thumb')) return;

        const logBlock = LOG_BLOCKS.find(log => brokenBlockPermutation.matches(`minecraft:${log}`));
        const saplingBlock = logBlock ? SAPLING_MAP[logBlock] : undefined;
        if (!logBlock || !saplingBlock) return;

        // 60% chance to skip — matches original Math.random() < 0.6 early return.
        if (Math.random() < 0.6) return;

        const viewDir = player.getViewDirection();
        const saplingLocation = block.dimension.getBlockFromRay(
            {
                x: block.location.x + 0.5,
                y: block.location.y,
                z: block.location.z + 0.5,
            },
            { x: 0, y: -1, z: 0 },
            {
                maxDistance: 16,
                includeLiquidBlocks: false,
                includePassableBlocks: false,
            }
        );

        if (!saplingLocation) return;

        const targetBlock =
            saplingLocation.face === Direction.Up   ? saplingLocation.block.above() :
            saplingLocation.face === Direction.Down ? saplingLocation.block.below() :
            (saplingLocation.block as any)[saplingLocation.face]?.();

        if (!targetBlock) return;

        targetBlock.setPermutation(BlockPermutation.resolve(`minecraft:${saplingBlock}`));
        block.dimension.spawnParticle('r4isen1920_originspe:experience_touch', saplingLocation.block.center());
    }
}