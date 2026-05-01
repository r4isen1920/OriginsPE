import { EquipmentSlot, TicksPerSecond, type ItemStack, type Player } from "@minecraft/server";

import { toAllPlayers } from "../../../origins/player";
import { getEquipment } from "../../../utils/items";


function less_shield_slowdown(player: Player) {
  if (!player.hasTag("perk_less_shield_slowdown")) return;

  const mainhand = getEquipment(player, EquipmentSlot.Mainhand) as ItemStack;
  const isHoldingBow = mainhand.typeId.includes("bow");

  if (isHoldingBow) {
    player.addEffect("resistance", TicksPerSecond * 3, { amplifier: 0, showParticles: false });
  } else {
    player.removeEffect("resistance");
  }
}

toAllPlayers(less_shield_slowdown, 5);