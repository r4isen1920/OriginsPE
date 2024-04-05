
import { toAllPlayers } from "../../../origins/player";

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function like_water(player) {

  if (
    !player.hasTag('power_like_water') ||
    player.isSneaking ||
    player.isSwimming
  ) {
    player.triggerEvent('r4isen1920_originspe:buoyant.normal');
    return
  }

  player.triggerEvent('r4isen1920_originspe:buoyant.float_on_water')

}

toAllPlayers(like_water, 3)
