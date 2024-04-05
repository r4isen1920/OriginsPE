
import { toAllPlayers } from "../../../origins/player";

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function familiar_face(player) {

  if (!player.hasTag('power_familiar_face')) return

  player.triggerEvent('r4isen1920_originspe:family_type.enderman')

}

toAllPlayers(familiar_face, 3)
