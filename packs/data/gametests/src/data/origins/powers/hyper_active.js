
import { ItemStack } from "@minecraft/server";
import { toAllPlayers } from "../../../origins/player";
import { findItem } from "../../../utils/items";

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function hyper_active(player) {

  let targetSugar;
  let convertTo;

  if (player.hasTag('power_hyper_active')) {
    targetSugar = findItem(player, 'minecraft:sugar')
    convertTo = 'r4isen1920_originspe:inchling_sugar'
  } else {
    targetSugar = findItem(player, 'r4isen1920_originspe:inchling_sugar')
    convertTo = 'minecraft:sugar'
  }

  if (!targetSugar) return
  if (targetSugar.item.typeId !== 'minecraft:sugar') return;

  player.getComponent('inventory').container.setItem(targetSugar.slot, new ItemStack(convertTo, targetSugar.item.amount))

}

toAllPlayers(hyper_active, 3)
