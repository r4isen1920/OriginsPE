
import { EntityDamageCause } from "@minecraft/server";

import { toAllPlayers } from "../../../origins/player";


/**
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function fresh_air(player) {
  if (!player.hasTag('power_fresh_air') || !player.isSleeping || player.location.y > 135) return

  player.applyDamage(2, { cause: EntityDamageCause.entityAttack });
  player.getComponent('health').setCurrentValue(player.getComponent('health').currentValue + 2)

  player.onScreenDisplay.setActionBar('origins.dialogue.avian_cant_sleep')
}

toAllPlayers(fresh_air, 1)
