
import { TicksPerSecond } from "@minecraft/server"

import { toAllPlayers } from "../../../origins/player"

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function burns_in_daylight(player) {
  if (!player.hasTag('power_burns_in_daylight')) return;

  player.triggerEvent('r4isen1920_originspe:burns_in_daylight.true')

}

toAllPlayers(burns_in_daylight, TicksPerSecond * 1)
