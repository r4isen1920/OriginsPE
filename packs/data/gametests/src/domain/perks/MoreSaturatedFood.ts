import {
    ItemCompleteUseAfterEvent,
    ItemStack,
    Player,
    world,
} from '@minecraft/server';

import { Perk } from '../../core/abilities/Ability';
import { RegisterPerk } from '../../core/abilities/Registries';
import { PlayerState } from '../../core/platform/PlayerState';

const GOOD_MEALS_LORE = '§r§6Good Meals§r';
const GOOD_MEALS_DESC = '§r§7Cooked with exceptional culinary expertise.§r';

const TEMP_FOOD_ITEMS = [
    'r4isen1920_originspe:temp_baked_potato',
    'r4isen1920_originspe:temp_beetroot_soup',
    'r4isen1920_originspe:temp_bread',
    'r4isen1920_originspe:temp_cooked_beef',
    'r4isen1920_originspe:temp_cooked_chicken',
    'r4isen1920_originspe:temp_cooked_cod',
    'r4isen1920_originspe:temp_cooked_mutton',
    'r4isen1920_originspe:temp_cooked_porkchop',
    'r4isen1920_originspe:temp_cooked_rabbit',
    'r4isen1920_originspe:temp_cooked_salmon',
    'r4isen1920_originspe:temp_dried_kelp',
];

const VANILLA_FOOD_IDS = new Set(
    TEMP_FOOD_ITEMS.map(id => id.replace('r4isen1920_originspe:temp_', 'minecraft:'))
);

@RegisterPerk
export class MoreSaturatedFood implements Perk {
    readonly id = 'more_saturated_food';
    readonly tickInterval = 3;

    static {
        world.afterEvents.itemCompleteUse.subscribe((ev) => MoreSaturatedFood.onItemCompleteUse(ev));
    }

    /**
     * Helper method to safely read array lines and confirm lore tags match
     */
    private static hasGoodMealsLore(item: ItemStack): boolean {
        const lore = item.getLore();
        return lore.some(line => line === GOOD_MEALS_LORE);
    }

    /**
     * Instantly strips custom culinary modifications from items when a player changes classes
     */
    onRelease(player: Player): void {
        const inventory = player.getComponent('inventory')?.container;
        if (!inventory) return;

        for (let slot = 0; slot < inventory.size; slot++) {
            const item = inventory.getItem(slot);
            if (!item) continue;

            if (VANILLA_FOOD_IDS.has(item.typeId) && MoreSaturatedFood.hasGoodMealsLore(item)) {
                const tempId = item.typeId.replace('minecraft:', 'r4isen1920_originspe:temp_');
                inventory.setItem(slot, new ItemStack(tempId, item.amount));
            }
        }
    }

    /**
     * Handles upgrading and item restoration routines matching the standard quality layout structure
     */
    onTick(player: Player): void {
        const inventory = player.getComponent('inventory')?.container;
        if (!inventory) return;

        // Reverts items back immediately if player is no longer a Cook
        if (!PlayerState.for(player).hasPerk('more_saturated_food')) {
            for (let slot = 0; slot < inventory.size; slot++) {
                const item = inventory.getItem(slot);
                if (!item) continue;

                if (VANILLA_FOOD_IDS.has(item.typeId) && MoreSaturatedFood.hasGoodMealsLore(item)) {
                    const tempId = item.typeId.replace('minecraft:', 'r4isen1920_originspe:temp_');
                    inventory.setItem(slot, new ItemStack(tempId, item.amount));
                }
            }
            return;
        }

        let converted = false;

        for (let slot = 0; slot < inventory.size; slot++) {
            const item = inventory.getItem(slot);
            if (!item) continue;

            if (TEMP_FOOD_ITEMS.includes(item.typeId)) {
                const vanillaId = item.typeId.replace('r4isen1920_originspe:temp_', 'minecraft:');
                const newItem = new ItemStack(vanillaId, item.amount);
                newItem.setLore([GOOD_MEALS_LORE, GOOD_MEALS_DESC]);
                
                inventory.setItem(slot, newItem);
                converted = true;
            } 
            else if (VANILLA_FOOD_IDS.has(item.typeId) && !MoreSaturatedFood.hasGoodMealsLore(item)) {
                item.setLore([GOOD_MEALS_LORE, GOOD_MEALS_DESC]);
                
                inventory.setItem(slot, item);
                converted = true;
            }
        }

        if (converted) {
            player.playSound('random.cook', { volume: 0.8, pitch: 1.0 });
        }
    }

    private static onItemCompleteUse(ev: ItemCompleteUseAfterEvent): void {
        const { itemStack, source } = ev;
        if (source.typeId !== 'minecraft:player') return;
        if (!itemStack || !VANILLA_FOOD_IDS.has(itemStack.typeId)) return;
        if (!MoreSaturatedFood.hasGoodMealsLore(itemStack)) return;

        const player = source as Player;
        if (!PlayerState.for(player).hasPerk('more_saturated_food')) return;

        player.runCommand('effect @s saturation 2 0 true');
    }
}