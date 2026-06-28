import {
    Player,
    PlayerBreakBlockAfterEvent,
} from '@minecraft/server';

import { Perk } from '../../core/abilities/Ability';
import { RegisterPerk } from '../../core/abilities/Registries';
import { PlayerState } from '../../core/platform/PlayerState';
import { AfterPlayerBreakBlock } from '../../core';


const CROP_TYPES = ['wheat', 'beetroot', 'carrots', 'potatoes'];


/**
 * When harvesting fully grown crops, there is a chance to get double the drops.
 */
@RegisterPerk
export class MoreCropsDrop implements Perk {
    readonly id = 'more_crop_drops';

    @AfterPlayerBreakBlock
    private static onBlockBreak(ev: PlayerBreakBlockAfterEvent): void {
        const { block, brokenBlockPermutation, player } = ev;

        if (!PlayerState.for(player).hasPerk('more_crop_drops')) return;

        const crop = CROP_TYPES.find(c => brokenBlockPermutation.matches(`minecraft:${c}`));
        if (!crop) return;
        if ((brokenBlockPermutation.getState('growth') as number) < 7) return;
        if (Math.random() < 0.6) return;

        player.runCommand(`loot spawn ${block.location.x} ${block.location.y} ${block.location.z} loot "gameplay/farming/${crop}_twice"`);
        block.dimension.spawnParticle('r4isen1920_originspe:experience_touch', block.center());
        player.playSound('random.orb', { volume: 0.25, pitch: 2.0 });
        player.playSound('firework.twinkle', { volume: 0.1, pitch: 1.25 });
    }
}