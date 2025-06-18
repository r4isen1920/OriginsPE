import { TicksPerSecond, EquipmentSlot, world } from "@minecraft/server";
import { toAllPlayers } from "../../../origins/player";

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
    "minecraft:andesite",
    "minecraft:granite",
    "minecraft:dripstone_block"
];

const CLAW_DIGGABLE_BLOCKS = [
    "minecraft:dirt",
    "minecraft:gravel",
    "minecraft:sand",
    "minecraft:grass_block"
];

export function claw_digging(player) {
    if (!player.hasTag('power_claw_digging')) {
        player.removeEffect("minecraft:haste");
        return;
    }

    const heldItem = player.getComponent("equippable")?.getEquipment(EquipmentSlot.Mainhand);
    const targetBlock = player.getBlockFromViewDirection()?.block;
    const isUnderground = player.location.y < 40;

    // Apply effects when bare handed
    if (!heldItem || heldItem.typeId === "minecraft:air") {

        if (targetBlock && UNDERGROUND_BLOCKS.includes(targetBlock.typeId) && isUnderground) {
            player.addEffect("minecraft:haste", TicksPerSecond * 2, {
                amplifier: 15,
                showParticles: false
            });

        }
        else if (targetBlock && CLAW_DIGGABLE_BLOCKS.includes(targetBlock.typeId)) {
            player.addEffect("minecraft:haste", TicksPerSecond * 2, {
                amplifier: 3,
                showParticles: false
            });
        }
    } else {
        player.removeEffect("minecraft:haste");
    }
    player.sendMessage(`You feel your claws ready to dig!`);
    
    if (!player.hasTag(`_init_bar`)) {
        world.beforeEvents.playerBreakBlock.subscribe((event) => {
            const player = event.player;
            const block = event.block;

                block.dimension.runCommand(`setblock ${block.location.x} ${block.location.y} ${block.location.z} air destroy`);
                player.sendMessage(`You dig through the ${block.typeId} with your claws!`);
                event.cancel = true; // Prevent default block breaking behavior
            
        });
        player.addTag(`_init_bar`);
    }

}

toAllPlayers(claw_digging, 1);




