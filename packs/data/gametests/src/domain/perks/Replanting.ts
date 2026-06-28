import {
    BlockPermutation,
    Direction,
    Player,
    PlayerBreakBlockAfterEvent,
} from '@minecraft/server';

import { Perk } from '../../core/abilities/Ability';
import { RegisterPerk } from '../../core/abilities/Registries';
import { PlayerState } from '../../core/platform/PlayerState';
import { AfterPlayerBreakBlock } from '../../core';
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
    readonly id = 'sapling_setblock';

    @AfterPlayerBreakBlock
    private static onBlockBreak(ev: PlayerBreakBlockAfterEvent): void {
        const { block, brokenBlockPermutation, player } = ev;

        if (!PlayerState.for(player).hasPerk('sapling_setblock')) return;

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

        const targetBlock = GreenThumb.getAdjacentBlock(saplingLocation.block, saplingLocation.face);

        if (!targetBlock) return;

        targetBlock.setPermutation(BlockPermutation.resolve(`minecraft:${saplingBlock}`));
        block.dimension.spawnParticle('r4isen1920_originspe:experience_touch', saplingLocation.block.center());
    }

    private static getAdjacentBlock(block: PlayerBreakBlockAfterEvent['block'], face: Direction): PlayerBreakBlockAfterEvent['block'] | undefined {
        switch (face) {
            case Direction.Up: return block.above();
            case Direction.Down: return block.below();
            case Direction.North: return block.north();
            case Direction.South: return block.south();
            case Direction.West: return block.west();
            case Direction.East: return block.east();
        }
    }
}