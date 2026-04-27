import { EquipmentSlot, TicksPerSecond, type ItemStack, type Player } from "@minecraft/server";

import { toAllPlayers } from "../../../origins/player";
import { getEquipment } from "../../../utils/items";

/**
 *
 * @param { import('@minecraft/server').Player } player
 */
function less_bow_slowdown(player: Player) {
  if (!player.hasTag("perk_less_bow_slowdown")) return;

  const mainhand = getEquipment(player, EquipmentSlot.Mainhand) as ItemStack;
  const isHoldingBow = mainhand.typeId.includes("bow");

  if (isHoldingBow) {
    player.addEffect("speed", TicksPerSecond * 3, { amplifier: 0, showParticles: false });
  } else {
    player.removeEffect("speed");
  }
}

toAllPlayers(less_bow_slowdown, 5);