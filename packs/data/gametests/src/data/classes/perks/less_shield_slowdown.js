
import { EquipmentSlot, TicksPerSecond } from "@minecraft/server";

import { toAllPlayers } from "../../../origins/player";
import { getEquipment } from "../../../utils/items";

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function less_shield_slowdown(player) {
  if (!player.hasTag('perk_less_shield_slowdown')) return;

  const isHoldingBow = getEquipment(player, EquipmentSlot.Mainhand).typeId.includes('bow');

  if (isHoldingBow) {
    player.addEffect('resistance', TicksPerSecond * 3, { amplifier: 0, showParticles: false });
  } else {
    player.removeEffect('resistance');
  }

}

toAllPlayers(less_shield_slowdown, 5)
