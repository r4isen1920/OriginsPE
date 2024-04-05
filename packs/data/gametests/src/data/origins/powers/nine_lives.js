
import { toAllPlayers } from "../../../origins/player";

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function nine_lives(player) {

  if (!player.hasTag('power_nine_lives')) return

  player.triggerEvent('r4isen1920_originspe:health.18')

}

toAllPlayers(nine_lives, 2)
