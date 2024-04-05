
import { TicksPerSecond } from "@minecraft/server";
import { toAllPlayers } from "../../../origins/player";

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function weak_arms(player) {

  if (
    !player.hasTag('power_weak_arms') ||
    player.getEffect('strength')
  ) {
    player.removeEffect('weakness');
    player.removeEffect('mining_fatigue');

    return
  }

  player.addEffect('weakness', TicksPerSecond * 12, { amplifier: 0, showParticles: false });
  player.addEffect('mining_fatigue', TicksPerSecond * 12, { amplifier: 0, showParticles: false });

}

toAllPlayers(weak_arms, 2)
