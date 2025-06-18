import { Player, system, world } from "@minecraft/server";
import { toAllPlayers } from "../../../origins/player";

const supportedOres = [
    "minecraft:coal_ore",
    "minecraft:iron_ore",
    "minecraft:gold_ore",
    "minecraft:diamond_ore",
    "minecraft:deepslate_coal_ore",
    "minecraft:deepslate_iron_ore",
    "minecraft:deepslate_gold_ore",
    "minecraft:deepslate_diamond_ore",
    "minecraft:copper_ore",
    "minecraft:emerald_ore",
    "minecraft:lapis_ore",
    "minecraft:redstone_ore",
    "minecraft:deepslate_copper_ore",
    "minecraft:deepslate_emerald_ore",
    "minecraft:deepslate_lapis_ore",
    "minecraft:deepslate_redstone_ore",
    "minecraft:nether_gold_ore",
    "minecraft:nether_quartz_ore"
];

/**
 * @param {Player} player 
 * @returns 
 */
export function burrow_sense(player) {
    // Check if player has the power and is using the item
    if (!player.hasTag('power_burrow_sense') || 
        !player.hasTag('_control_use_burrow_sense')) {
        return;
    }

    const dimension = player.dimension;
    const pos = player.location;
    const foundOres = [];

    // Scan for ores
    for (let dx = -8; dx <= 8; dx++) {
        for (let dy = -8; dy <= 8; dy++) {
            for (let dz = -8; dz <= 8; dz++) {
                const blockLoc = { x: pos.x + dx, y: pos.y + dy, z: pos.z + dz };
                const block = dimension.getBlock(blockLoc);

                if (block && supportedOres.includes(block.typeId)) {
                    foundOres.push(block.center());
                }
            }
        }
    }

    // Create highlight cubes for found ores
    if (foundOres.length > 0) {
        const duration = 600; // 30 seconds
        const entities = [];
        
        // Summon highlight entities for each ore
        foundOres.forEach(oreLoc => {
            const entity = dimension.spawnEntity("origins:ore_highlight", {
                x: Math.floor(oreLoc.x) + 0.5,
                y: Math.floor(oreLoc.y),
                z: Math.floor(oreLoc.z) + 0.5
            });

            // Make the highlight visible only to the player who used the ability
            entity.addTag(`owner:${player.id}`);
            entity.setDynamicProperty("ownerName", player.name);
            entities.push(entity);
        });
    
        // Remove highlights after duration
        system.runTimeout(() => {
            entities.forEach(entity => {
                if (entity && entity.isValid) {
                    entity.remove();
                }
            });
        }, duration);
    }

    // Remove the control tag after use
    player.removeTag('_control_use_burrow_sense');
}

world.afterEvents.playerBreakBlock.subscribe(event => {
    const block = event.block;
    const dimension = event.dimension;

    const entity = dimension.getEntitiesAtBlockLocation(block.location)
        .find(e => e.typeId === "origins:ore_highlight");
    if (entity) {
        entity.remove();
    }
})


toAllPlayers(burrow_sense, 3);