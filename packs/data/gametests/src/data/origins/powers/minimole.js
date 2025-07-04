import { world } from "@minecraft/server";
import { toAllPlayers } from "../../../origins/player";

/**
 * Minimole: Makes the player half-size (scale 0.5), with 14 health.
 * @param { import('@minecraft/server').Player } player 
 */
function minimole(player) {
  if (!player.hasTag('power_minimole')) return;

  player.triggerEvent('r4isen1920_originspe:scale.0.5');
  player.triggerEvent('r4isen1920_originspe:health.14');

  player.camera.setCamera('r4isen1920_originspe:small');

  const location = player.location;
  // Get the block above the player's head
  const block = world.getDimension(player.dimension.id).getBlock({
    x: Math.floor(location.x),
    y: Math.floor(location.y) + 1,
    z: Math.floor(location.z)
  });
  if (block && !block.isAir) {
    player.addEffect('speed', 20, { amplifier: 2, showParticles: false });
  }
}

toAllPlayers(minimole, 5);