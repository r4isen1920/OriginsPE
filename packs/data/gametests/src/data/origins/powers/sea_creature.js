
import { toAllPlayers } from "../../../origins/player";

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function sea_creature(player) {

  if (!player.hasTag('power_sea_creature')) return

  player.triggerEvent('r4isen1920_originspe:family_type.fish')

}

toAllPlayers(sea_creature, 3)
