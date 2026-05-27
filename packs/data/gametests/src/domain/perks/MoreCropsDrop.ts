import {
    Player,
    PlayerBreakBlockAfterEvent,
    world,
} from '@minecraft/server';

import { Perk } from '../Ability';
import { RegisterPerk } from '../Registries';
import { PlayerState } from '../../core/PlayerState';


const CROP_TYPES = ['wheat', 'beetroot', 'carrots', 'potatoes'];


/**
 * When harvesting fully grown crops, there is a chance to get double the drops.
 */
@RegisterPerk
export class MoreCropsDrop implements Perk {
    readonly id = 'more_crops_drop';

    private static handler: ((ev: PlayerBreakBlockAfterEvent) => void) | undefined;
    private static refCount = 0;

    onAcquire(_player: Player): void {
        MoreCropsDrop.refCount++;
        if (MoreCropsDrop.refCount === 1) {
            MoreCropsDrop.handler = (ev) => MoreCropsDrop.onBlockBreak(ev);
            world.afterEvents.playerBreakBlock.subscribe(MoreCropsDrop.handler);
        }
    }

    onRelease(_player: Player): void {
        MoreCropsDrop.refCount = Math.max(0, MoreCropsDrop.refCount - 1);
        if (MoreCropsDrop.refCount === 0 && MoreCropsDrop.handler) {
            world.afterEvents.playerBreakBlock.unsubscribe(MoreCropsDrop.handler);
            MoreCropsDrop.handler = undefined;
        }
    }

    onTick(_player: Player): void {}

    private static onBlockBreak(ev: PlayerBreakBlockAfterEvent): void {
        const { block, brokenBlockPermutation, player } = ev;

        if (!PlayerState.for(player).hasPerk('more_crops_drop')) return;

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