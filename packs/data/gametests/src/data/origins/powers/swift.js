
import { toAllPlayers } from "../../../origins/player";

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function swift(player) {
  if (!player.hasTag('power_swift')) return

  player.triggerEvent('r4isen1920_originspe:movement.0.15');
}

toAllPlayers(swift, 5)
