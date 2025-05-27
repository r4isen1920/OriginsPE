import { toAllPlayers } from "../../../origins/player";

/**
 * Makes players with the 'power_heavy_bones' tag move slowly in water.
 * @param { import('@minecraft/server').Player } player 
 */
function heavyBones(player) {
  if (!player.hasTag('power_heavy_bones')) return;

  if (player.isInWater) {
    player.triggerEvent('r4isen1920_originspe:underwater_movement.0.005');
  } else {
    player.triggerEvent('r4isen1920_originspe:underwater_movement.0.01');
  }
}

toAllPlayers(heavyBones, 5);