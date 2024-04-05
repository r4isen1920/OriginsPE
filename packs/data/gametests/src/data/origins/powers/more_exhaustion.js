
import { toAllPlayers } from "../../../origins/player";

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function more_exhaustion(player) {

  if (!player.hasTag('power_more_exhaustion')) return

  player.triggerEvent('r4isen1920_originspe:exhaustion.shulk')

}

toAllPlayers(more_exhaustion, 1)
