import { toAllPlayers } from "../../../origins/player";

/**
 * Grants temporary water breathing effect to players for 60 seconds, only once.
 * @param { import('@minecraft/server').Player } player 
 */
function land_breathing_grace(player) {
  if (!player.hasTag('power_water_breathing')) return;
  if (player.hasTag('_land_breathing_grace_given')) return; // Already given

  player.runCommandAsync('effect @s water_breathing 60 0 true');
  player.addTag('_land_breathing_grace_given'); // Mark as given
}

toAllPlayers(land_breathing_grace, 3);