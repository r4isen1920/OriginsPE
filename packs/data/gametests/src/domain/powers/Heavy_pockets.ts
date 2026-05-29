import { Player } from '@minecraft/server';
import { Power } from '../Ability';
import { PlayerState } from '../../core/PlayerState';
import { RegisterPower } from '../Registries';
import { PlayerTick } from '../../core/Ticker';


const GOLD_ITEMS = new Set([
    'minecraft:gold_ingot',
    'minecraft:gold_block',
    'minecraft:golden_apple',
    'minecraft:golden_carrot',
    'minecraft:golden_sword',
    'minecraft:golden_pickaxe',
    'minecraft:golden_axe',
    'minecraft:golden_shovel',
    'minecraft:golden_hoe',
    'minecraft:golden_helmet',
    'minecraft:golden_chestplate',
    'minecraft:golden_leggings',
    'minecraft:golden_boots',
]);

const STACK_SIZE = 64;
const NUGGET_THRESHOLD = 12;

const THRESHOLDS = [
    { stacks: 18, event: 'r4isen1920_originspe:movement.0.025' },
    { stacks: 12, event: 'r4isen1920_originspe:movement.0.05'  },
    { stacks: 6,  event: 'r4isen1920_originspe:movement.0.075' },
];

const NUGGET_EVENT = 'r4isen1920_originspe:movement.0.075';
const NORMAL_EVENT = 'r4isen1920_originspe:movement.0.1';


/**
 * HEAVY POCKETS (Piglin)
 * Carrying too many gold items will slow your movement speed in stages.
 */
@RegisterPower
export class Heavy_pockets implements Power {
    readonly id = 'heavy_pockets';

    onRelease(player: Player): void {
        player.runCommand(`event entity @s ${NORMAL_EVENT}`);
        PlayerState.for(player).clearFlagPrefix('heavy_pockets_');
    }

    @PlayerTick(2)
    static onPlayerTick(player: Player): void {
        if (!PlayerState.for(player).hasPower('heavy_pockets')) return;

        const inventory = player.getComponent('inventory');
        if (!inventory) return;

        let goldCount = 0;
        let nuggetCount = 0;

        for (let i = 0; i < inventory.container.size; i++) {
            const item = inventory.container.getItem(i);
            if (!item) continue;
            if (item.typeId === 'minecraft:gold_nugget') {
                nuggetCount += item.amount;
            } else if (GOLD_ITEMS.has(item.typeId)) {
                goldCount += item.amount;
            }
        }

        let applied = false;
        for (const threshold of THRESHOLDS) {
            if (goldCount >= threshold.stacks * STACK_SIZE) {
                player.runCommand(`event entity @s ${threshold.event}`);
                applied = true;
                break;
            }
        }

        if (!applied && nuggetCount >= NUGGET_THRESHOLD) {
            player.runCommand(`event entity @s ${NUGGET_EVENT}`);
            applied = true;
        }

        if (!applied) {
            player.runCommand(`event entity @s ${NORMAL_EVENT}`);
        }
    }
}