import { Player, system } from "@minecraft/server";
import { toAllPlayers } from "../../../origins/player";

const supportedOres = [
    "minecraft:coal_ore",
    "minecraft:iron_ore",
    "minecraft:gold_ore",
    "minecraft:diamond_ore",
    "minecraft:deepslate_coal_ore",
    "minecraft:deepslate_iron_ore",
    "minecraft:deepslate_gold_ore",
    "minecraft:deepslate_diamond_ore"
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
    let foundOre = null;

    // Scan for ores in a 16x16x16 cube around player
    for (let dx = -8; dx <= 8; dx++) {
        for (let dy = -8; dy <= 8; dy++) {
            for (let dz = -8; dz <= 8; dz++) {
                const blockLoc = { x: pos.x + dx, y: pos.y + dy, z: pos.z + dz };
                const block = dimension.getBlock(blockLoc);

                if (block && supportedOres.includes(block.typeId)) {
                    if (!foundOre) {
                        foundOre = blockLoc;
                    }
                }
            }
        }
    }

    // Create particle trail to ore if found
    if (foundOre) {
        const steps = 30; // Number of particles
        const duration = 1200; // Duration in ticks (60 seconds)
        let elapsed = 0;
        let trailActive = true;

        // Create repeating particle trail
        const trailInterval = system.runInterval(() => {
            if (!trailActive) {
                system.clearRun(trailInterval);
                return;
            }

            elapsed++;
            
            // Check if ore still exists
            const currentBlock = dimension.getBlock(foundOre);
            if (!currentBlock || !supportedOres.includes(currentBlock.typeId)) {
                trailActive = false;
                system.clearRun(trailInterval);
                return;
            }

            for (let i = 0; i <= steps; i++) {
                const t = i / steps;
                const particlePos = {
                    x: pos.x + (foundOre.x - pos.x) * t,
                    y: pos.y + (foundOre.y - pos.y) * t,
                    z: pos.z + (foundOre.z - pos.z) * t
                };
                
                dimension.spawnParticle(
                    "minecraft:blue_flame_particle",
                    particlePos
                );
            }

            // Clear trail after duration
            if (elapsed >= duration) {
                trailActive = false;
                system.clearRun(trailInterval);
            }
        }, 5);

    // Remove the control tag after use
    player.removeTag('_control_use_burrow_sense');
    }
}
toAllPlayers(burrow_sense, 3);