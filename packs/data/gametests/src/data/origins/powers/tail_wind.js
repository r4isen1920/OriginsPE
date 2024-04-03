
import { TicksPerSecond } from "@minecraft/server";

import { toAllPlayers } from "../../../origins/player";

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function tail_wind(player) {
  if (!player.hasTag('power_tail_wind')) return;

  player.addEffect('speed', TicksPerSecond * 3, { amplifier: 1, showParticles: false })
}

toAllPlayers(tail_wind, 1)
