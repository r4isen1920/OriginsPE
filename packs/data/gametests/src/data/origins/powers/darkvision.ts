import { world, system, Player } from "@minecraft/server";


/**
 * @param {Player} player 
 * @returns 
 */
export function darkvision(player: Player) {
  
        if (!player.hasTag('power_darkvision')) return;

        player.triggerEvent('r4isen1920_originspe:light_level');
        const lightLevelProperty = player.getProperty('r4isen1920_originspe:light_level');
        const lightLevel =
            typeof lightLevelProperty === "number"
                ? lightLevelProperty
                : typeof lightLevelProperty === "string"
                    ? Number(lightLevelProperty)
                    : NaN;

        if (!Number.isFinite(lightLevel)) return;

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
