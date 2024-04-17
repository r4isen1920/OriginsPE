
import { EquipmentSlot, TicksPerSecond } from "@minecraft/server";

import { toAllPlayers } from "../../../origins/player";
import { getEquipment } from "../../../utils/items";

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function less_bow_slowdown(player) {
  if (!player.hasTag('perk_less_bow_slowdown')) return;

  const isHoldingBow = getEquipment(player, EquipmentSlot.Mainhand).typeId.includes('bow');

  if (isHoldingBow) {
    player.addEffect('speed', TicksPerSecond * 3, { amplifier: 0, showParticles: false });
  } else {
    player.removeEffect('speed');
  }

}

toAllPlayers(less_bow_slowdown, 5)
