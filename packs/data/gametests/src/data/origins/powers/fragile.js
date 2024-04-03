
import { toAllPlayers } from "../../../origins/player";

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function fragile(player) {

  if (!player.hasTag('power_fragile')) return

  player.triggerEvent('r4isen1920_originspe:health.14')

}

toAllPlayers(fragile, 1)
