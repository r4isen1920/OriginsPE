import { findItem } from "../../../utils/items";
import { TicksPerSecond, system, world } from "@minecraft/server";

const supportedOres = [
    "minecraft:coal_ore",
    "minecraft:iron_ore",
    "minecraft:gold_ore",
    "minecraft:diamond_ore"
];

function burrow_sense(player) {
    // Only trigger if player has the "mole" origin
    if (typeof player.getOrigin === "function" && player.getOrigin() !== "mole") {
        return;
    }

    const dimension = player.dimension; // Get the player's current dimension
    const pos = player.location; // Get player position
     
    for (let dx = -8; dx <= 8; dx++) {
        for (let dy = -8; dy <= 8; dy++) {
            for (let dz = -8; dz <= 8; dz++) {
                const blockLoc = { x: pos.x + dx, y: pos.y + dy, z: pos.z + dz };
                const block = dimension.getBlock(blockLoc);

                if (block && supportedOres.includes(block.typeId)) {
                    // Highlight using particles (visible indicator)
                    dimension.spawnParticle(
                        "minecraft:happy_villager_particle",
                        { x: blockLoc.x + 0.5, y: blockLoc.y + 0.5, z: blockLoc.z + 0.5 });
                    player.sendMessage(`Nakakita ka ug ore sa (${blockLoc.x}, ${blockLoc.y}, ${blockLoc.z})`);
                }
            }
        }
    }
}

module.exports = burrow_sense;