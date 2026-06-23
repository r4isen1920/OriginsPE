import {
    BlockPermutation,
    ItemStack,
    Player,
    EquipmentSlot,
    EntityEquippableComponent,
    EntityInventoryComponent,
    ItemDurabilityComponent,
    world
} from '@minecraft/server';

import { Perk } from '../../core/abilities/Ability';
import { RegisterPerk } from '../../core/abilities/Registries';
import { PlayerState } from '../../core/platform/PlayerState';

const IS_QUALITY_SET_PROPERTY = 'is_quality_set';
const QUALITY_LORE = '§r§6Quality Equipment§r';
const QUALITY_DESC = '§r§7Crafted with exceptional blacksmith expertise.§r';

const MATERIALS = ['diamond', 'golden', 'iron', 'leather', 'netherite', 'stone', 'wooden'];
const DIGGABLE_TYPES = ['axe', 'hoe', 'shovel', 'pickaxe'];
const ARMOR_TYPES = ['boots', 'chestplate', 'helmet', 'leggings'];
const ALL_TYPES = ['sword', ...DIGGABLE_TYPES, ...ARMOR_TYPES];

const VANILLA_ITEMS = new Set(
    MATERIALS.flatMap(material => ALL_TYPES.map(type => `minecraft:${material}_${type}`))
);

@RegisterPerk
export class QualityEquipments implements Perk {
    readonly id = 'quality_equipments';
    readonly tickInterval = 10;

    /**
     * Handles upgrading and durability breaks exclusively for active Blacksmiths.
     */
    onTick(player: Player): void {
        const inventoryComponent = player.getComponent('inventory') as EntityInventoryComponent | undefined;
        const inventory = inventoryComponent?.container;
        if (!inventory) return;

        let converted = false;

        for (let slot = 0; slot < inventory.size; slot++) {
            const item = inventory.getItem(slot);
            if (!item || !VANILLA_ITEMS.has(item.typeId)) continue;

            const isQuality = item.getDynamicProperty(IS_QUALITY_SET_PROPERTY) === true;

            if (!isQuality) {
                const lore = item.getLore();
                item.setLore([...lore, QUALITY_LORE, QUALITY_DESC]);
                item.setDynamicProperty(IS_QUALITY_SET_PROPERTY, true);
                
                inventory.setItem(slot, item);
                converted = true;
            }
        }

        // Handle tool shattering safely on the main hand slot without loop interference
        const equippable = player.getComponent('equippable') as EntityEquippableComponent | undefined;
        if (equippable) {
            const item = equippable.getEquipment(EquipmentSlot.Mainhand);
            if (item && item.getDynamicProperty(IS_QUALITY_SET_PROPERTY) === true) {
                const durability = item.getComponent('durability') as ItemDurabilityComponent | undefined;
                
                if (durability && durability.damage >= durability.maxDurability) {
                    equippable.setEquipment(EquipmentSlot.Mainhand, undefined);
                    player.playSound('random.break', { volume: 1.0, pitch: 1.0 });
                }
            }
        }

        // Play feedback particles and sound effects if an item was upgraded
        if (converted) {
            player.playSound('smithing_table.use', { volume: 0.8, pitch: 1.1 });
            player.dimension.spawnParticle('minecraft:villager_happy', {
                x: player.location.x,
                y: player.location.y + 1,
                z: player.location.z
            });
        }
    }
}