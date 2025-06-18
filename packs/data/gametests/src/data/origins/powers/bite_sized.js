import { toAllPlayers } from "../../../origins/player";
import { world } from "@minecraft/server";

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function bite_sized(player) {
    if (!player.hasTag('power_bite_sized')) return

    player.triggerEvent('r4isen1920_originspe:scale.0.25');
    player.triggerEvent('r4isen1920_originspe:health.10');
    player.triggerEvent('r4isen1920_originspe:family_type.bite_sized');

    // Check if player is in 1-block height space
    const location = player.location;
    const block = world.getDimension('overworld').getBlock({ x: location.x, y: location.y + 1.5, z: location.z });
    
    if (block && !block.isAir) {
        // Increased duration to 20 ticks (1 second) for smoother effect
        // Reduced amplifier to prevent jerky movement
        player.addEffect('speed', 20, { amplifier: 2, showParticles: false });
    }
}

// Reduced check frequency to every 15 ticks (0.75 seconds)
toAllPlayers(bite_sized, 15)