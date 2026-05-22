import {
    EquipmentSlot,
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

/**
 * Foods you cook will grant additional saturation when eaten.
 */
@RegisterPerk
export class GoodMeals implements Perk {
    readonly id = 'good_meals';

    private static handler: ((ev: ItemCompleteUseAfterEvent) => void) | undefined;
    private static refCount = 0;

    onAcquire(_player: Player): void {
        GoodMeals.refCount++;
        if (GoodMeals.refCount === 1) {
            GoodMeals.handler = (ev) => GoodMeals.onItemCompleteUse(ev);
            world.afterEvents.itemCompleteUse.subscribe(GoodMeals.handler);
        }
    }

    onRelease(_player: Player): void {
        GoodMeals.refCount = Math.max(0, GoodMeals.refCount - 1);
        if (GoodMeals.refCount === 0 && GoodMeals.handler) {
            world.afterEvents.itemCompleteUse.unsubscribe(GoodMeals.handler);
            GoodMeals.handler = undefined;
        }
    }

    onTick(player: Player): void {
        const inventory = player.getComponent('inventory')?.container;
        if (!inventory) return;

        const hasPerk = PlayerState.for(player).hasPerk('good_meals');
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

        if (!TEMP_FOOD_ITEMS.some(i => itemStack.typeId.includes(i.replace('r4isen1920_originspe:temp_', '')))) return;
        if (!itemStack.getLore().includes(GOOD_MEALS_LORE)) return;
        if (!PlayerState.for(source).hasPerk('good_meals')) return;

        source.addEffect('saturation', TicksPerSecond, { amplifier: 1 });
    }
}