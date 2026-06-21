import {
    ItemCompleteUseAfterEvent,
    ItemStack,
    Player,
    TicksPerSecond,
    world,
} from '@minecraft/server';

import { Perk } from '../Ability';
import { RegisterPerk } from '../Registries';
import { PlayerState } from '../../core/PlayerState';


const GOOD_MEALS_LORE = '§r§6Good Meals§r';

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

/**
 * Foods you cook will grant additional saturation when eaten.
 */
@RegisterPerk
export class MoreSaturatedFood implements Perk {
	readonly id = 'more_saturated_food';

    private static handler: ((ev: ItemCompleteUseAfterEvent) => void) | undefined;
    private static refCount = 0;

    onAcquire(_player: Player): void {
        MoreSaturatedFood.refCount++;
        if (MoreSaturatedFood.refCount === 1) {
            MoreSaturatedFood.handler = (ev) => MoreSaturatedFood.onItemCompleteUse(ev);
            world.afterEvents.itemCompleteUse.subscribe(MoreSaturatedFood.handler);
        }
    }

    onRelease(player: Player): void {
        MoreSaturatedFood.refCount = Math.max(0, MoreSaturatedFood.refCount - 1);
        if (MoreSaturatedFood.refCount === 0 && MoreSaturatedFood.handler) {
            world.afterEvents.itemCompleteUse.unsubscribe(MoreSaturatedFood.handler);
            MoreSaturatedFood.handler = undefined;
        }

        // Strip Good Meals lore from inventory on class change.
        const inventory = player.getComponent('inventory')?.container;
        if (!inventory) return;
        for (let slot = 0; slot < inventory.size; slot++) {
            const item = inventory.getItem(slot);
            if (!item || !VANILLA_FOOD_IDS.has(item.typeId)) continue;
            if (!item.getLore().includes(GOOD_MEALS_LORE)) continue;
            const stripped = new ItemStack(item.typeId, item.amount);
            stripped.setLore([]);
            inventory.setItem(slot, stripped);
        }
    }

    onTick(player: Player): void {
        const inventory = player.getComponent('inventory')?.container;
        if (!inventory) return;

        const hasPerk = PlayerState.for(player).hasPerk('more_saturated_food');
        let converted = false;

        for (let slot = 0; slot < inventory.size; slot++) {
            const item = inventory.getItem(slot);
            if (!item) continue;
            if (!TEMP_FOOD_ITEMS.includes(item.typeId)) continue;

            const vanillaId = item.typeId.replace('r4isen1920_originspe:temp_', 'minecraft:');
            const newItem = new ItemStack(vanillaId, item.amount);
            if (hasPerk) newItem.setLore([GOOD_MEALS_LORE]);
            inventory.setItem(slot, newItem);
            converted = true;
        }

        if (hasPerk && converted) player.playSound('random.cook');
    }

    private static onItemCompleteUse(ev: ItemCompleteUseAfterEvent): void {
        const { itemStack, source } = ev;

        if (!VANILLA_FOOD_IDS.has(itemStack.typeId)) return;
        if (!itemStack.getLore().includes(GOOD_MEALS_LORE)) return;

        source.addEffect('saturation', TicksPerSecond, { amplifier: 1 });
    }
}