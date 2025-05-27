import { world, system } from "@minecraft/server";

/**
 * @param {import('@minecraft/server').Player} player 
 */
export function photosensitive(player) {
        
        if (!player.hasTag('power_photosensitive')) return;

        // Check for direct sunlight exposure
        player.triggerEvent('r4isen1920_originspe:light_level');
        const lightLevel = player.getProperty('r4isen1920_originspe:light_level');

        // Only apply effects when in direct sunlight (light level > 14)
        if (lightLevel > 14) {
            // Apply stronger debuff effects
            player.addEffect("weakness", 40, {
                amplifier: 1,
                showParticles: true
            });
            player.addEffect("slowness", 40, {
                amplifier: 1,
                showParticles: true
            });
            // Add small fire effect to prevent healing
            player.setOnFire(1, true);
            // Direct sunlight damage
            if (!player.hasTag('sunlight_damage_cooldown')) {
                player.applyDamage(2); // Increased damage
                player.addTag('sunlight_damage_cooldown');
                
                system.runTimeout(() => {
                    player.removeTag('sunlight_damage_cooldown');
                }, 20);
            }
        }
}
// Run check every 10 ticks
system.runInterval(() => {
    for (const player of world.getAllPlayers()) {
        photosensitive(player);
    }
}, 10);