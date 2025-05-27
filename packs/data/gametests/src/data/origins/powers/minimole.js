import { toAllPlayers } from "../../../origins/player";

/**
 * Minimole: Makes the player half-size (scale 0.5), with 14 health.
 * @param { import('@minecraft/server').Player } player 
 */
function minimole(player) {
  if (!player.hasTag('power_minimole')) return;

  player.triggerEvent('r4isen1920_originspe:scale.0.5');
  player.triggerEvent('r4isen1920_originspe:health.14');
  // Optionally, set a custom family type for minimole if you want to add one in player.json
  // player.triggerEvent('r4isen1920_originspe:family_type.minimole');
}

toAllPlayers(minimole, 5);