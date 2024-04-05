
import { toAllPlayers } from "../../../origins/player";

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function scare_creepers(player) {

  if (!player.hasTag('power_scare_creepers')) return

  player.triggerEvent('r4isen1920_originspe:family_type.cat')

}

toAllPlayers(scare_creepers, 3)
