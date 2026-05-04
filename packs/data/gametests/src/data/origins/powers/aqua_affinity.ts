import { Player, TicksPerSecond } from "@minecraft/server";

import { toAllPlayers } from "../../../origins/player";
import { Vec3 } from "@bedrock-oss/bedrock-boost";


function aqua_affinity(player: Player) {

  const getBlock = function(posOffset: Vec3): import('@minecraft/server').Block | null {
    return player.dimension.getBlock(Vec3.from(player.location).add(posOffset)) ?? null;
  };

  const headBlock = getBlock(Vec3.from(0, 1, 0));

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