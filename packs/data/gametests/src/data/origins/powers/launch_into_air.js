
import { toAllPlayers } from "../../../origins/player";

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function launch_into_air(player) {
  if (!player.hasTag('power_launch_into_air')) return

  


}

toAllPlayers(launch_into_air, 1)
