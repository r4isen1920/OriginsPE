import { EquipmentSlot, Player } from "@minecraft/server";
import { toAllPlayers } from "../../../origins/player";
import { getEquipment } from "../../../utils/items";

/**
 * 
 * @param { Player } player 
 */
export function barehanded(player: Player) {
   const equipment = getEquipment(player, EquipmentSlot.Mainhand);
   const mainhand = Array.isArray(equipment) ? equipment[0] : equipment;
   const mainhandTypeId = mainhand?.typeId ?? 'minecraft:air';

   if (player.hasTag("power_barehanded") && (mainhandTypeId === '' || mainhandTypeId === 'minecraft:air')) {
      player.addTag('_barehanded');
      player.removeEffect('minecraft:weakness');
   } else if (player.hasTag('_barehanded') && mainhandTypeId !== '' && mainhandTypeId !== 'minecraft:air') {
      player.addEffect('minecraft:weakness', 100, { amplifier: 255, showParticles: false });
      player.removeTag('_barehanded');
   }
}

toAllPlayers(barehanded, 5);
