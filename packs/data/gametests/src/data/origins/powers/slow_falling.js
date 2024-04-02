
import { TicksPerSecond } from "@minecraft/server";

import { toAllPlayers } from "../../../origins/player";

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function slow_falling(player) {
  if (!player.hasTag('power_slow_falling')) return;
  player.addEffect('slow_falling', TicksPerSecond * 3, { amplifier: 3, hideParticles: true })
}

toAllPlayers(slow_falling, 1)
