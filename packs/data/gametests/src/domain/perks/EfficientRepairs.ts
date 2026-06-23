import {
    ItemStack,
    Player,
    EquipmentSlot,
    EntityInventoryComponent,
    ItemDurabilityComponent,
    world,
    system
} from '@minecraft/server';

import { Perk } from '../../core/abilities/Ability';
import { RegisterPerk } from '../../core/abilities/Registries';
import { PlayerState } from '../../core/platform/PlayerState';

const FLAT_BONUS_DURABILITY = 100;
const REPAIR_PERCENT_MULTIPLIER = 1;

const IS_QUALITY_SET_PROPERTY = 'is_quality_set';
const ITEM_ID_PROPERTY = 'quality_item_id';

const durabilityCache = new Map<string, number>();

let isInitialized = false;

function initializeRepairListener() {
    if (isInitialized) return;
    isInitialized = true;

    world.afterEvents.playerInventoryItemChange.subscribe((ev) => {
        const { player, slot } = ev;

        if (!PlayerState.for(player).hasPerk('efficient_repairs')) return;

        const inventoryComponent = player.getComponent('inventory') as EntityInventoryComponent | undefined;
        const inventory = inventoryComponent?.container;
        if (!inventory) return;

        const item = inventory.getItem(slot);
        if (!item || !item.getDynamicProperty(IS_QUALITY_SET_PROPERTY)) return;

        let itemId = item.getDynamicProperty(ITEM_ID_PROPERTY) as string | undefined;
        
        if (!itemId) {
            itemId = `${item.typeId}_${system.currentTick}_${Math.floor(Math.random() * 10000)}`;
            item.setDynamicProperty(ITEM_ID_PROPERTY, itemId);
            inventory.setItem(slot, item);
        }

        const durability = item.getComponent('durability') as ItemDurabilityComponent | undefined;
        if (!durability) return;

        const cacheKey = `${player.id}_${itemId}`;
        const previousDamage = durabilityCache.get(cacheKey);
        const currentDamage = durability.damage;

        if (previousDamage !== undefined && currentDamage < previousDamage) {
            const amountRepaired = previousDamage - currentDamage;
            
            let bonusRepairs = 0;
            if (FLAT_BONUS_DURABILITY > 0) {
                bonusRepairs = FLAT_BONUS_DURABILITY;
            } else {
                bonusRepairs = Math.floor(amountRepaired * REPAIR_PERCENT_MULTIPLIER);
            }

            if (bonusRepairs > 0) {
                const targetMaxDamageLimit = Math.floor(durability.maxDurability * 0.5);
                
                durability.damage = Math.max(targetMaxDamageLimit, currentDamage - bonusRepairs);
                inventory.setItem(slot, item);
                
                player.playSound('random.anvil_use', { volume: 0.4, pitch: 1.6 });
            }
        }

        durabilityCache.set(cacheKey, durability.damage);
    });
}

@RegisterPerk
export class EfficientRepairs implements Perk {
    readonly id = 'efficient_repairs';
    readonly tickInterval = 20;

    onTick(player: Player): void {
        initializeRepairListener();

        if (!PlayerState.for(player).hasPerk('efficient_repairs')) return;

        const inventoryComponent = player.getComponent('inventory') as EntityInventoryComponent | undefined;
        const inventory = inventoryComponent?.container;
        if (!inventory) return;

        for (let slot = 0; slot < inventory.size; slot++) {
            const item = inventory.getItem(slot);
            if (item && item.getDynamicProperty(IS_QUALITY_SET_PROPERTY)) {
                let itemId = item.getDynamicProperty(ITEM_ID_PROPERTY) as string | undefined;
                if (!itemId) {
                    itemId = `${item.typeId}_${system.currentTick}_${Math.floor(Math.random() * 10000)}`;
                    item.setDynamicProperty(ITEM_ID_PROPERTY, itemId);
                    inventory.setItem(slot, item);
                }

                const durability = item.getComponent('durability') as ItemDurabilityComponent | undefined;
                if (durability) {
                    durabilityCache.set(`${player.id}_${itemId}`, durability.damage);
                }
            }
        }
    }
}