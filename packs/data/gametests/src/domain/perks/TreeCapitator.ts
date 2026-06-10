import {
    Block,
    EquipmentSlot,
    GameMode,
    Player,
    PlayerBreakBlockAfterEvent,
    world,
} from '@minecraft/server';

import { Perk } from '../Ability';
import { RegisterPerk } from '../Registries';
import { PlayerState } from '../../core/PlayerState';


export const LOG_BLOCKS = [
    'acacia_log',
    'birch_log',
    'cherry_log',
    'crimson_stem',
    'dark_oak_log',
    'jungle_log',
    'mangrove_log',
    'oak_log',
    'spruce_log',
    'warped_stem',
];

const DIRECTIONS = ['north', 'south', 'west', 'east', 'above', 'below'] as const;
type NeighborDirection = typeof DIRECTIONS[number];

@RegisterPerk
export class TreeCapitator implements Perk {
    readonly id = 'tree_felling';
    readonly tickInterval = 2;

    private static handler: ((ev: PlayerBreakBlockAfterEvent) => void) | undefined;
    private static refCount = 0;

    onAcquire(_player: Player): void {
        TreeCapitator.refCount++;
        if (TreeCapitator.refCount === 1) {
            TreeCapitator.handler = (ev) => TreeCapitator.onBlockBreak(ev);
            world.afterEvents.playerBreakBlock.subscribe(TreeCapitator.handler);
        }
    }

    onRelease(_player: Player): void {
        TreeCapitator.refCount = Math.max(0, TreeCapitator.refCount - 1);
        if (TreeCapitator.refCount === 0 && TreeCapitator.handler) {
            world.afterEvents.playerBreakBlock.unsubscribe(TreeCapitator.handler);
            TreeCapitator.handler = undefined;
        }
    }

    onTick(player: Player): void {
        player.dimension.getEntities({
            location: player.location,
            maxDistance: 48,
            type: 'r4isen1920_originspe:vein_miner',
        })?.forEach(veinMinerEntity => {
            const currentBlock = veinMinerEntity.dimension.getBlock(veinMinerEntity.location);

            if ((veinMinerEntity.getDynamicProperty('r4isen1920_originspe:iteration') as number) > 27) {
                veinMinerEntity.remove();
                return;
            }

            const targetBlock = veinMinerEntity.getDynamicProperty('r4isen1920_originspe:targetBlock') as string;
            if (currentBlock?.permutation.matches(`minecraft:${targetBlock}`)) {
                DIRECTIONS.forEach(direction => {
                    const neighbor = TreeCapitator.getNeighborBlock(currentBlock, direction);
                    if (!neighbor) return;

                    const newEntity = player.dimension.spawnEntity(
                        'r4isen1920_originspe:vein_miner',
                        neighbor.center(),
                    );
                    newEntity.setDynamicProperty('r4isen1920_originspe:targetBlock', targetBlock);
                    newEntity.setDynamicProperty('r4isen1920_originspe:originator', veinMinerEntity.getDynamicProperty('r4isen1920_originspe:originator'));
                    newEntity.setDynamicProperty('r4isen1920_originspe:iteration', (veinMinerEntity.getDynamicProperty('r4isen1920_originspe:iteration') as number) + 1);
                });

                veinMinerEntity.runCommand('setblock ~~~ air [] destroy');
                player.dimension.spawnParticle('r4isen1920_originspe:vein_mine', currentBlock.center());

                // Teleport dropped items to the originator
                const originatorId = veinMinerEntity.getDynamicProperty('r4isen1920_originspe:originator') as string;
                const originator = world.getEntity(originatorId);
                if (originator) {
                    currentBlock.dimension.getEntities({
                        location: currentBlock.location,
                        maxDistance: 5,
                        type: 'minecraft:item',
                    }).forEach(itemEntity => {
                        if (itemEntity.getComponent('item')?.itemStack.typeId.includes(targetBlock)) {
                            itemEntity.teleport(originator.location);
                        }
                    });
                }
            }

            veinMinerEntity.remove();
        });
    }

    private static onBlockBreak(ev: PlayerBreakBlockAfterEvent): void {
        const { block, brokenBlockPermutation, player } = ev;

        if (!PlayerState.for(player).hasPerk('tree_felling')) return;
        if (player.matches({ gameMode: GameMode.Creative })) return;

        const heldItem = player.getComponent('equippable')?.getEquipment(EquipmentSlot.Mainhand);
        if (!heldItem?.typeId.includes('_axe')) return;

        const logBlock = LOG_BLOCKS.find(log => brokenBlockPermutation.matches(`minecraft:${log}`));
        if (!logBlock) return;

        DIRECTIONS.forEach(direction => {
            const neighbor = TreeCapitator.getNeighborBlock(block, direction);
            if (!neighbor) return;

            const newVeinMinerEntity = player.dimension.spawnEntity(
                'r4isen1920_originspe:vein_miner',
                neighbor.center(),
            );
            newVeinMinerEntity.setDynamicProperty('r4isen1920_originspe:targetBlock', logBlock);
            newVeinMinerEntity.setDynamicProperty('r4isen1920_originspe:originator', player.id);
            newVeinMinerEntity.setDynamicProperty('r4isen1920_originspe:iteration', 0);
        });
    }

    private static getNeighborBlock(block: Block, direction: NeighborDirection): Block | undefined {
        switch (direction) {
            case 'north': return block.north();
            case 'south': return block.south();
            case 'west': return block.west();
            case 'east': return block.east();
            case 'above': return block.above();
            case 'below': return block.below();
        }
    }
}