
import { toAllPlayers } from "../../../origins/player";

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function water_breathing(player) {

  if (
    !player.hasTag('power_water_breathing') ||
    player.hasTag('_breathable_underwater')
  ) return

  player.triggerEvent('r4isen1920_originspe:breathable.underwater');
  player.removeTag('_breathable_land')

}

toAllPlayers(water_breathing, 3)
