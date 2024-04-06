
import { TicksPerSecond } from "@minecraft/server"

import { toAllPlayers } from "../../../origins/player"

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function undead(player) {
  if (!player.hasTag('power_undead')) return;

  player.triggerEvent('r4isen1920_originspe:family_type.undead')

}

toAllPlayers(undead, TicksPerSecond * 1)
