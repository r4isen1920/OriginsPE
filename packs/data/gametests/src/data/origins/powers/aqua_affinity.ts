import { Player, TicksPerSecond } from "@minecraft/server";

import { toAllPlayers } from "../../../origins/player";
import { Vector3 } from "../../../utils/Vec3";


function aqua_affinity(player: Player) {

  const getBlock = function(posOffset: Vector3): import('@minecraft/server').Block | null {
    return player.dimension.getBlock(Vector3.add(player.location, posOffset)) ?? null;
  };

  const headBlock = getBlock(new Vector3(0, 1, 0));

  if (
    player.hasTag('power_aqua_affinity') &&
    headBlock && 
    (
      headBlock.permutation.matches('water') || 
      headBlock.permutation.matches('flowing_water') || 
      headBlock.isWaterlogged 
    )
  ) {
    player.addEffect('conduit_power', TicksPerSecond * 12, { amplifier: 1, showParticles: false });
  } else {
    player.removeEffect('conduit_power');
  }
}

toAllPlayers(aqua_affinity, 3);