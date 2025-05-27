import { TicksPerSecond, EquipmentSlot, world } from "@minecraft/server";
import { toAllPlayers } from "../../../origins/player";

const CLAW_DIGGABLE_BLOCKS = [
    "minecraft:dirt",
    "minecraft:gravel",
    "minecraft:sand",
    "minecraft:grass"
];

const UNDERGROUND_BLOCKS = [
    "minecraft:stone",
    "minecraft:deepslate",
    "minecraft:iron_ore",
    "minecraft:coal_ore",
    "minecraft:diamond_ore",
    "minecraft:gold_ore",
    "minecraft:copper_ore",
    "minecraft:deepslate_iron_ore",
    "minecraft:deepslate_coal_ore",
    "minecraft:deepslate_diamond_ore",
    "minecraft:deepslate_gold_ore",
    "minecraft:deepslate_copper_ore",
    "minecraft:cobblestone",
    "minecraft:diorite",
    "minecraft:andesite"
];

/**
 * @param { import('@minecraft/server').Player } player 
 */
function claw_digging(player) {
   
        if (!player.hasTag('power_claw_digging')) {
            player.removeEffect("minecraft:haste");
            player.removeEffect("minecraft:strength");
            return;
        }

        const heldItem = player.getComponent("equippable")?.getEquipment(EquipmentSlot.Mainhand);
        const targetBlock = player.getBlockFromViewDirection()?.block;
        const isUnderground = player.location.y < 40;

        // Apply effects when bare handed
        if (!heldItem || heldItem.typeId === "minecraft:air") {
            // Check if looking at underground blocks and is underground
            if (targetBlock && UNDERGROUND_BLOCKS.includes(targetBlock.typeId) && isUnderground) {
                // Super high mining speed for underground blocks
                player.addEffect("minecraft:haste", TicksPerSecond * 2, {
                    amplifier: 15,
                    showParticles: false
                });
                player.addEffect("minecraft:strength", TicksPerSecond * 2, {
                    amplifier: 5,
                    showParticles: false
                });
            } 
            // Regular blocks can be mined fast anywhere
            else if (targetBlock && CLAW_DIGGABLE_BLOCKS.includes(targetBlock.typeId)) {
                player.addEffect("minecraft:haste", TicksPerSecond * 2, {
                    amplifier: 3,
                    showParticles: false
                });
                player.addEffect("minecraft:strength", TicksPerSecond * 2, {
                    amplifier: 3,
                    showParticles: false
                });
            } else {
                // Remove effects if not looking at valid blocks
                player.removeEffect("minecraft:haste");
                player.removeEffect("minecraft:strength");
            }
        } else {
            // Remove effects when holding items
            player.removeEffect("minecraft:haste");
            player.removeEffect("minecraft:strength");
        }
}


toAllPlayers(claw_digging, 1);