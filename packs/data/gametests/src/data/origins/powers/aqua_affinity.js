import { TicksPerSecond } from "@minecraft/server";

import { toAllPlayers } from "../../../origins/player";
import { Vector3 } from "../../../utils/Vec3";

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function aqua_affinity(player) {
  /**
   * @param { Vector3 } posOffset 
   * @returns { import('@minecraft/server').Block | null }
   */
  const getBlock = function(posOffset) {
    return player.dimension.getBlock(Vector3.add(player.location, posOffset));
  };

  const headBlock = getBlock(new Vector3(0, 1, 0)); // Block at the player's head

  if (
    player.hasTag('power_aqua_affinity') &&
    headBlock && 
    (headBlock.permutation.matches('water') || headBlock.permutation.matches('flowing_water'))
  ) {
    player.addEffect('conduit_power', TicksPerSecond * 12, { amplifier: 1, showParticles: false });
  } else {
    player.removeEffect('conduit_power');
  }
}

toAllPlayers(aqua_affinity, 3);