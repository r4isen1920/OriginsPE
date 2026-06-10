import { Player, EquipmentSlot, world } from '@minecraft/server';
import { Power } from '../Ability';
import { RegisterPower } from '../Registries';

// Service & utility imports from your codebase
import { ResourceBarService } from '../../services/ResourceBarService'; 
import { ItemUtils } from '../../utils/ItemUtils';
import { PlayerState } from '../../core/PlayerState';

interface GoldValue {
    typeId: string;
    value: number;
}

const GOLD_ITEMS: GoldValue[] = [
    { typeId: 'minecraft:golden_helmet', value: 0.5 },
    { typeId: 'minecraft:golden_chestplate', value: 0.7 },
    { typeId: 'minecraft:golden_leggings', value: 0.7 },
    { typeId: 'minecraft:golden_boots', value: 0.4 },
    { typeId: 'minecraft:golden_sword', value: 0.2 },
    { typeId: 'minecraft:golden_axe', value: 0.3 },
    { typeId: 'minecraft:golden_pickaxe', value: 0.3 },
    { typeId: 'minecraft:golden_shovel', value: 0.1 },
    { typeId: 'minecraft:golden_hoe', value: 0.2 },
    { typeId: 'minecraft:gold_block', value: 0.9 },
    { typeId: 'minecraft:gold_ingot', value: 0.1 },
    { typeId: 'minecraft:gold_nugget', value: 0.0111111111111111 }
];

const GOLD_WEARABLES: GoldValue[] = [
    { typeId: 'minecraft:golden_helmet', value: 17.5 },
    { typeId: 'minecraft:golden_chestplate', value: 17.5 },
    { typeId: 'minecraft:golden_leggings', value: 17.5 },
    { typeId: 'minecraft:golden_boots', value: 17.5 }
];

const MAX_GOLD_SCORE = 70;
const BAR_ID = 15;

/**
 * Normalizes values to a 0..100 scale for the HUD renderer.
 */
function normalize(value: number, max: number = MAX_GOLD_SCORE): number {
    return Math.min(Math.max((value / max) * 100, 0), 100);
}

/**
 * The more gold items you carry in your inventory, worn, or held, 
 * the less damage you'll receive from any source. 
 * You can mitigate up to 90% of damage received this way.
 */
@RegisterPower
export class Pride implements Power {
    readonly id = 'pride';
    readonly icon = '15';

    onTick(player: Player): void {
        const inventorySlots = ItemUtils.findAll(player);
        let inventoryGoldScore = 0;

        for (const slot of inventorySlots) {
            if (!slot.item) continue;
            const match = GOLD_ITEMS.find(g => g.typeId === slot.item?.typeId);
            if (match) {
                inventoryGoldScore += slot.item.amount * match.value;
            }
        }
        inventoryGoldScore = Math.min(inventoryGoldScore, MAX_GOLD_SCORE);

        let equipmentGoldScore = 0;
        const slotsToCheck = [
            EquipmentSlot.Head,
            EquipmentSlot.Chest,
            EquipmentSlot.Legs,
            EquipmentSlot.Feet,
            EquipmentSlot.Mainhand,
            EquipmentSlot.Offhand
        ];

        for (const slot of slotsToCheck) {
            const item = ItemUtils.getEquipment(player, slot);
            if (!item) continue;
            const match = GOLD_WEARABLES.find(g => g.typeId === item.typeId);
            if (match) {
                equipmentGoldScore += match.value;
            }
        }

        const rawTotalScore = inventoryGoldScore + equipmentGoldScore;
        const currentDisplayValue = Math.round(rawTotalScore);

        const state = PlayerState.for(player);
        const prevDisplayValue = state.getFlag<number>('pride_gold_value');
        const isBarInitialized = state.getFlag<boolean>('pride_bar_init');

        if (prevDisplayValue === undefined || !isBarInitialized) {
            state.setFlag('pride_gold_value', currentDisplayValue);
            state.setFlag('pride_bar_init', true);
            
            if (currentDisplayValue > 0) {
                ResourceBarService.push(player, {
                    id: BAR_ID,
                    from: normalize(currentDisplayValue),
                    to: normalize(currentDisplayValue),
                    durationSeconds: 1,
                    persist: true
                });
            }
            return;
        }

        if (prevDisplayValue !== currentDisplayValue) {
            state.setFlag('pride_gold_value', currentDisplayValue);

            if (currentDisplayValue > 0) {
                ResourceBarService.push(player, {
                    id: BAR_ID,
                    from: normalize(prevDisplayValue),
                    to: normalize(currentDisplayValue),
                    durationSeconds: 1,
                    persist: true
                });
            } else {
                ResourceBarService.pop(player, BAR_ID);
            }
        }
    }

    /**
     * Cleans up custom player flags and hides the visual bar 
     * immediately when an Origin change/removal event occurs.
     */
    onLose(player: Player): void {
        const state = PlayerState.for(player);
        ResourceBarService.pop(player, BAR_ID);
        state.setFlag('pride_gold_value', undefined);
        state.setFlag('pride_bar_init', undefined);
    }
}

// Actively intercept damage to reduce it up to 90% based on their gold score
world.beforeEvents.entityHurt.subscribe((event) => {
    const player = event.hurtEntity;
    if (!(player instanceof Player)) return;

    const state = PlayerState.for(player);
    
    if (!state.getPowers().includes('pride')) return;

    const goldValue = state.getFlag<number>('pride_gold_value') ?? 0;
    if (goldValue <= 0) return;

    const mitigationPercent = (goldValue / MAX_GOLD_SCORE) * 0.90;
    const finalMitigation = Math.min(mitigationPercent, 0.90); 

    event.damage = event.damage * (1 - finalMitigation);
});

// WIP Bar and Cap todo