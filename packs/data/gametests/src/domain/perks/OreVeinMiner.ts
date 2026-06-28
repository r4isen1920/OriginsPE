import {
    Block,
    EquipmentSlot,
    GameMode,
    Player,
    PlayerBreakBlockAfterEvent,
    world,
} from '@minecraft/server';

import { Perk } from '../../core/abilities/Ability';
import { RegisterPerk } from '../../core/abilities/Registries';
import { PlayerState } from '../../core/platform/PlayerState';
import { AfterPlayerBreakBlock } from '../../core';


const ORE_BLOCKS = [
    'ancient_debris',
    'coal_ore',
    'copper_ore',
    'deepslate_coal_ore',
    'deepslate_diamond_ore',
    'deepslate_emerald_ore',
    'deepslate_gold_ore',
    'deepslate_iron_ore',
    'deepslate_lapis_ore',
    'deepslate_redstone_ore',
    'lit_deepslate_redstone_ore',
    'diamond_ore',
    'emerald_ore',
    'gold_ore',
    'iron_ore',
    'lapis_ore',
    'nether_gold_ore',
    'quartz_ore',
    'redstone_ore',
    'lit_redstone_ore',
];

const DIRECTIONS = ['north', 'south', 'west', 'east', 'above', 'below'] as const;
type NeighborDirection = typeof DIRECTIONS[number];


@RegisterPerk
export class OreVeinMiner implements Perk {
    readonly id = 'ore_vein_miner';
    readonly tickInterval = 2;

    onTick(player: Player): void {
        if (!PlayerState.for(player).hasPerk('ore_vein_miner')) return;
        if (player.isSneaking) return;

        const entities = player.dimension.getEntities({
            location: player.location,
            maxDistance: 48,
            type: 'r4isen1920_originspe:vein_miner',
        });

        for (const veinMinerEntity of entities) {
            // Only process entities belonging to this player
            const originatorId = veinMinerEntity.getDynamicProperty('r4isen1920_originspe:originator') as string;
            if (originatorId !== player.id) continue;

            const iteration = veinMinerEntity.getDynamicProperty('r4isen1920_originspe:iteration') as number;
            const currentBlock = veinMinerEntity.dimension.getBlock(veinMinerEntity.location);

            if (iteration > 27) {
                veinMinerEntity.remove();
                continue;
            }

            const targetBlock = veinMinerEntity.getDynamicProperty('r4isen1920_originspe:targetBlock') as string;

            if (currentBlock?.permutation.matches(`minecraft:${targetBlock}`)) {
                DIRECTIONS.forEach(direction => {
                    const neighbor = OreVeinMiner.getNeighborBlock(currentBlock, direction);
                    if (!neighbor) return;

                    const newEntity = player.dimension.spawnEntity(
                        'r4isen1920_originspe:vein_miner',
                        neighbor.center(),
                    );
                    newEntity.setDynamicProperty('r4isen1920_originspe:targetBlock', targetBlock);
                    newEntity.setDynamicProperty('r4isen1920_originspe:originator', originatorId);
                    newEntity.setDynamicProperty('r4isen1920_originspe:iteration', iteration + 1);
                });

                veinMinerEntity.runCommand('setblock ~~~ air [] destroy');
                player.dimension.spawnParticle('r4isen1920_originspe:vein_mine', currentBlock.center());

                const originator = world.getEntity(originatorId);
                if (originator) {
                    currentBlock.dimension.getEntities({
                        location: currentBlock.location,
                        maxDistance: 5,
                        type: 'minecraft:item',
                    }).forEach(itemEntity => {
                        if (itemEntity.getComponent('item')?.itemStack.typeId.includes(targetBlock.replace('_ore', ''))) {
                            itemEntity.teleport(originator.location);
                        }
                    });
                }
            }

            veinMinerEntity.remove();
        }
    }

    @AfterPlayerBreakBlock
    private static onBlockBreak(ev: PlayerBreakBlockAfterEvent): void {
        const { block, brokenBlockPermutation, player } = ev;

        if (!PlayerState.for(player).hasPerk('ore_vein_miner')) return;
        if (player.matches({ gameMode: GameMode.Creative })) return;

        const heldItem = player.getComponent('equippable')?.getEquipment(EquipmentSlot.Mainhand);
        if (!heldItem?.typeId.includes('_pickaxe')) return;

        const oreBlock = ORE_BLOCKS.find(ore => brokenBlockPermutation.matches(`minecraft:${ore}`));
        if (!oreBlock) return;

        DIRECTIONS.forEach(direction => {
            const neighbor = OreVeinMiner.getNeighborBlock(block, direction);
            if (!neighbor) return;

            const newVeinMinerEntity = player.dimension.spawnEntity(
                'r4isen1920_originspe:vein_miner',
                neighbor.center(),
            );
            newVeinMinerEntity.setDynamicProperty('r4isen1920_originspe:targetBlock', oreBlock);
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