import { world, system } from "@minecraft/server"


/**
 * @param {Player} player 
 * @returns 
 */
export function darkvision(player) {
  
        if (!player.hasTag('power_darkvision')) return;

        player.triggerEvent('r4isen1920_originspe:light_level');
        const lightLevel = player.getProperty('r4isen1920_originspe:light_level');
        
        if (lightLevel < 7) {
            player.addEffect("night_vision", 250,{
                amplifier: 0,
                showParticles: false
            });
        }
        else {
            player.removeEffect("night_vision");
        }
}
// Add this at the end of the file
system.runInterval(() => {
    for (const player of world.getAllPlayers()) {
        darkvision(player);
    }
}, 10);
