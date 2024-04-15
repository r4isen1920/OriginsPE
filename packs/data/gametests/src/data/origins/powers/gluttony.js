
import { toAllPlayers } from "../../../origins/player";

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function gluttony(player) {

  if (!player.hasTag('power_gluttony')) return

  player.triggerEvent('r4isen1920_originspe:exhaustion.piglin')

}

toAllPlayers(gluttony, 1)
