
import { TicksPerSecond } from "@minecraft/server";

import { toAllPlayers } from "../../../origins/player";
import { Vector3 } from "../../../utils/Vec3";

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function slow_falling(player) {
  const block = player.dimension.getBlock(Vector3.add(player.location, new Vector3(0, -1, 0)))
  if (!player.hasTag('power_slow_falling')) return;

  if (block.permutation.matches('minecraft:air')) player.addEffect('slow_falling', TicksPerSecond * 3, { amplifier: 3, showParticles: false })
  else player.removeEffect('slow_falling')
}

toAllPlayers(slow_falling, 1)
