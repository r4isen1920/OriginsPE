import { EquipmentSlot } from "@minecraft/server";
import { toAllPlayers } from "../../../origins/player";
import { getEquipment } from "../../../utils/items";

export function barehanded(player) {
   const mainhand = getEquipment(player, EquipmentSlot.Mainhand);
   if (player.hasTag("power_barehanded") && (mainhand.typeId === '' || mainhand.typeId === 'minecraft:air')) {
      player.addTag('_barehanded')
   } else {
      player.removeTag('_barehanded');
   }
}

toAllPlayers(barehanded, 5);
