import { EquipmentSlot, Player } from "@minecraft/server";
import { toAllPlayers } from "../../../origins/player";
import { getEquipment } from "../../../utils/items";

/**
 * 
 * @param { Player } player 
 */
export function barehanded(player) {
   const mainhand = getEquipment(player, EquipmentSlot.Mainhand);
   if (player.hasTag("power_barehanded") && (mainhand.typeId === '' || mainhand.typeId === 'minecraft:air')) {
      player.addTag('_barehanded');
      player.removeEffect('minecraft:weakness');
   } else if (player.hasTag('_barehanded') && mainhand.typeId !== '' && mainhand.typeId !== 'minecraft:air') {
      player.addEffect('minecraft:weakness', 100, { amplifier: 255, showParticles: false });
      player.removeTag('_barehanded');
   }
}

toAllPlayers(barehanded, 5);
