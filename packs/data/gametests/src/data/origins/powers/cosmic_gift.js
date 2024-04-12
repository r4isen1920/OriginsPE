
import { TicksPerSecond } from "@minecraft/server";

import { toAllPlayers } from "../../../origins/player";

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function cosmic_gift(player) {

  if (!player.hasTag('power_cosmic_gift') || !player.isOnGround) {
    player.addEffect('slow_falling', TicksPerSecond * 12, { amplifier: 3, showParticles: false })
    player.removeEffect('jump_boost');
    return
  }

  player.addEffect('jump_boost', TicksPerSecond * 12, { amplifier: 2, showParticles: false });
  player.removeEffect('slow_falling');

}

toAllPlayers(cosmic_gift, 2)
