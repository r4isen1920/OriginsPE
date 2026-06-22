import { ItemCompleteUseAfterEvent, Player, EquipmentSlot } from '@minecraft/server';
import { Perk } from '../../core/abilities/Ability';
import { RegisterPerk } from '../../core/abilities/Registries';
import { PlayerState } from '../../core/platform/PlayerState';
import { ItemUtils } from '../../utils/ItemUtils'; // Imported from your codebase

const MARKER_LORE = "§r§dCook's Special";

const VALID_SOUPS = [
    'minecraft:mushroom_stew',
    'minecraft:rabbit_stew',
    'minecraft:beetroot_soup',
    'minecraft:suspicious_stew'
];

/**
 * Soups crafted or held by the cook grant regeneration when eaten.
 */
@RegisterPerk
export class BetterStew implements Perk {
    readonly id = 'better_stew';
    readonly tickInterval = 10; // Runs every 10 ticks (0.5s) to save performance

    onTick(player: Player): void {
        if (!PlayerState.for(player).hasPower('better_stew')) {
			return;
		}

        const slots = ItemUtils.findAll(player, 'all');
        
        for (const slot of slots) {
            const item = slot.item;
            if (!item || !VALID_SOUPS.includes(item.typeId)) continue;

            const currentLore = item.getLore();
            if (!currentLore.includes(MARKER_LORE)) {
                item.setLore([...currentLore, MARKER_LORE]);
                
                // Save it back into the container slot
                const container = ItemUtils.container(player);
                if (container) {
                    container.setItem(slot.slot, item);
                }
            }
        }
    }

    /**
     * Fires automatically when a player finishes eating/drinking an item.
     */
    onItemCompleteUse(player: Player, ev: ItemCompleteUseAfterEvent): void {
        const item = ev.itemStack;
        if (!item || !VALID_SOUPS.includes(item.typeId)) return;

        // Check if the soup has the special lore stamp applied by a Cook
        const lore = item.getLore();
        if (!lore.includes(MARKER_LORE)) return;

        // Grant Regeneration II for 2 seconds (40 ticks)
        player.addEffect('minecraft:regeneration', 40, {
            amplifier: 1,
            showParticles: true
        });
    }
}