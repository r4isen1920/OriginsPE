
import { TicksPerSecond } from "@minecraft/server";

import { toAllPlayers } from "../../../origins/player";

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function sprint_jump(player) {

  if (!player.hasTag('power_sprint_jump') || !player.isSprinting) {
    player.removeEffect('jump_boost');
    return
  }

  player.addEffect('jump_boost', TicksPerSecond * 12, { amplifier: 1, showParticles: false })
  player.triggerEvent('r4isen1920_originspe:movement.0.15')
}

toAllPlayers(sprint_jump, 2)
