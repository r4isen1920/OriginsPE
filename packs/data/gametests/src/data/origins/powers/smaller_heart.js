
import { toAllPlayers } from "../../../origins/player";

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function smaller_heart(player) {

  if (!player.hasTag('power_smaller_heart')) return

  player.triggerEvent('r4isen1920_originspe:health.12')

}

toAllPlayers(smaller_heart, 1)
