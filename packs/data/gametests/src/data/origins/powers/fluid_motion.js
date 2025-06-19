import { toAllPlayers } from "../../../origins/player";

/**
 * Grants faster underwater movement for players with the 'power_fluid_motion' tag.
 * @param { import('@minecraft/server').Player } player 
 */
function fluidMotion(player) {
  if (!player.hasTag('power_fluid_motion')) return;

  if (player.isInWater) {
    // Increase movement speed only while in water
    player.triggerEvent('r4isen1920_originspe:underwater_movement.0.05');
  } else {
    // Reset to normal movement speed when not in water
    player.triggerEvent('r4isen1920_originspe:underwater_movement.0.01');
  }
}

toAllPlayers(fluidMotion, 5);