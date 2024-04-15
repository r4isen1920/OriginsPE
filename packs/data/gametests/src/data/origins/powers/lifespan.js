
import { toAllPlayers } from "../../../origins/player";

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function lifespan(player) {

  if (!player.hasTag('power_lifespan')) return

  player.triggerEvent('r4isen1920_originspe:health.14')

}

toAllPlayers(lifespan, 4)
