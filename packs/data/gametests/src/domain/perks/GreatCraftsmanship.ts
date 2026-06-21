import {
    BlockPermutation,
    ItemStack,
    Player,
    PlayerBreakBlockAfterEvent,
    TicksPerSecond,
    world,
} from '@minecraft/server';

import { Perk } from '../Ability';
import { RegisterPerk } from '../Registries';
import { PlayerState } from '../../core/PlayerState';


const BLACKSMITH_PREFIX = 'r4isen1920_originspe:blacksmith_';
const IS_QUALITY_SET_PROPERTY = 'is_quality_set';
const QUALITY_LORE = '§r§6Quality Equipment§r';

const MATERIALS = ['diamond', 'golden', 'iron', 'leather', 'netherite', 'stone', 'wooden'];
const DIGGABLE_TYPES = ['axe', 'hoe', 'shovel', 'pickaxe'];
const ARMOR_TYPES = ['boots', 'chestplate', 'helmet', 'leggings'];
const ALL_TYPES = ['sword', ...DIGGABLE_TYPES, ...ARMOR_TYPES];

const VANILLA_ITEMS = new Set(
    MATERIALS.flatMap(material => ALL_TYPES.map(type => `minecraft:${material}_${type}`))
);

const CROP_TYPES = [
    'wheat', 'beetroot', 'carrots', 'potatoes', 'melon_stem',
    'pumpkin_stem', 'sweet_berry_bush', 'nether_wart',
];


/**
 * Any equipment you craft or smith will have increased durability, efficiency, and damage.
 */
@RegisterPerk
export class GreatCraftsmanship implements Perk {
    readonly id = 'quality_equipment';

    private static handler: ((ev: PlayerBreakBlockAfterEvent) => void) | undefined;
    private static refCount = 0;

    onAcquire(_player: Player): void {
        GreatCraftsmanship.refCount++;
        if (GreatCraftsmanship.refCount === 1) {
            GreatCraftsmanship.handler = (ev) => GreatCraftsmanship.onBlockBreak(ev);
            world.afterEvents.playerBreakBlock.subscribe(GreatCraftsmanship.handler);
        }
    }

    onRelease(_player: Player): void {
        GreatCraftsmanship.refCount = Math.max(0, GreatCraftsmanship.refCount - 1);
        if (GreatCraftsmanship.refCount === 0 && GreatCraftsmanship.handler) {
            world.afterEvents.playerBreakBlock.unsubscribe(GreatCraftsmanship.handler);
            GreatCraftsmanship.handler = undefined;
        }
    }

    onTick(player: Player): void {
        const inventory = player.getComponent('inventory')?.container;
        if (!inventory) return;

        const hasPerk = PlayerState.for(player).hasPerk('quality_equipment');
        let converted = false;

        for (let slot = 0; slot < inventory.size; slot++) {
            const item = inventory.getItem(slot);
            if (!item) continue;
            if (!VANILLA_ITEMS.has(item.typeId)) continue;
            if (item.getDynamicProperty(IS_QUALITY_SET_PROPERTY)) continue;

            const baseTypeId = item.typeId.replace('minecraft:', '');
            const newTypeId = hasPerk
                ? `${BLACKSMITH_PREFIX}${baseTypeId}`
                : `minecraft:${baseTypeId}`;
            const newItem = new ItemStack(newTypeId, item.amount);

            const lore: string[] = [];
            if (ARMOR_TYPES.some(t => baseTypeId.includes(t)) && baseTypeId.includes('netherite'))
                lore.push('§r§7', '§r§9+1 Knockback Resistance§r');
            if (hasPerk) lore.push(QUALITY_LORE);
            newItem.setLore(lore);
            newItem.setDynamicProperty(IS_QUALITY_SET_PROPERTY, true);

            inventory.setItem(slot, newItem);
            converted = true;
        }

        if (hasPerk && converted)
            player.playSound('smithing_table.use', { volume: 0.75, pitch: 1.25 });
    }

    private static onBlockBreak(ev: PlayerBreakBlockAfterEvent): void {
        const { block, brokenBlockPermutation, itemStackBeforeBreak, player } = ev;

        if (!GreatCraftsmanship.isValidQualityEquipment(itemStackBeforeBreak)) return;

        if (itemStackBeforeBreak?.typeId.includes(BLACKSMITH_PREFIX)) {
            GreatCraftsmanship.handleDurability(itemStackBeforeBreak, player);
        }

        GreatCraftsmanship.spawnBreakParticles(block, brokenBlockPermutation);
    }

    private static isValidQualityEquipment(itemStack: any): boolean {
        return (
            itemStack &&
            [...VANILLA_ITEMS].some(i => itemStack.typeId.includes(i.replace('minecraft:', ''))) &&
            DIGGABLE_TYPES.some(t => itemStack.typeId.includes(t)) &&
            itemStack.getLore()?.includes(QUALITY_LORE)
        );
    }

    private static handleDurability(itemStack: any, player: Player): void {
        const durability = itemStack.getComponent('durability');
        if (!durability) return;

        const damageAmount = GreatCraftsmanship.calculateDurabilityLoss(durability);
        GreatCraftsmanship.updateInventory(itemStack, durability, player, damageAmount);
    }

    private static calculateDurabilityLoss(durability: any): number {
        const damageChance = durability.getDamageChanceRange();
        const max = damageChance.max || 1;
        const min = damageChance.min || 1;

        if (min === max) return min;

        const randomRoll = Math.floor(Math.random() * max) + 1;
        return randomRoll === min ? min : 0;
    }

    private static updateInventory(itemStack: any, durability: any, player: Player, damageAmount: number): void {
        const inventory = player.getComponent('inventory')?.container;
        if (!inventory) return;

        let itemSlot = -1;
        for (let i = 0; i < inventory.size; i++) {
            const current = inventory.getItem(i);
            if (!current || current.typeId !== itemStack.typeId) continue;
            const currentDurability = current.getComponent('durability');
            if (currentDurability && currentDurability.damage === durability.damage) {
                itemSlot = i;
                break;
            }
        }

        if (itemSlot === -1) return;

        durability.damage += Math.min(damageAmount, durability.maxDurability - durability.damage);

        if (durability.damage >= durability.maxDurability) {
            player.playSound('random.break', { volume: 1.0, pitch: 1.0 });
            inventory.setItem(itemSlot, undefined);
        } else {
            inventory.setItem(itemSlot, itemStack);
        }
    }

    private static spawnBreakParticles(block: any, brokenBlockPermutation: BlockPermutation): void {
        const isCrop = CROP_TYPES.some(type => brokenBlockPermutation.matches(`minecraft:${type}`));
        block.dimension.spawnParticle(
            `r4isen1920_originspe:blacksmiths_${isCrop ? 'harvest' : 'dig'}`,
            block.center(),
        );
    }
}