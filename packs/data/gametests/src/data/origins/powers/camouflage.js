
import { toAllPlayers } from "../../../origins/player";

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function camouflage(player) {
  if (player.hasTag('power_camouflage') && player.isSneaking) {

    player.triggerEvent('r4isen1920_originspe:family_type.camouflage')

  } else {

    player.triggerEvent('r4isen1920_originspe:family_type.player')

  }
}

toAllPlayers(camouflage, 3)
