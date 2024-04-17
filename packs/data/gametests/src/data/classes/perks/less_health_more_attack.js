
import { TicksPerSecond } from "@minecraft/server";

import { toAllPlayers } from "../../../origins/player";
import { MathR4 } from "../../../utils/Math";

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function less_health_more_attack(player) {
  if (!player.hasTag('perk_less_health_more_attack')) return;

  /**
   * @type { import('@minecraft/server').EntityHealthComponent }
   */
  const playerHealth = player.getComponent('health')

  const playerHealthPercentage = Math.floor((playerHealth.effectiveMax / playerHealth.currentValue) * 100)
  if (playerHealthPercentage >= 75) return;

  player.addEffect('strength', TicksPerSecond * 3, { amplifier: MathR4.clamp(Math.floor(playerHealthPercentage / 25), 0, 1), showParticles: false })

}

toAllPlayers(less_health_more_attack, 5)
