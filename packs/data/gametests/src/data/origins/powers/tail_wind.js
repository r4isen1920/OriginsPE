
import { toAllPlayers } from "../../../origins/player";

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function tail_wind(player) {

  if (!player.hasTag('power_tail_wind')) return

  player.triggerEvent('r4isen1920_originspe:movement.0.15')

}

toAllPlayers(tail_wind, 1)
