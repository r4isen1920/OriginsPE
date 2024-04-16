
import { ItemStack } from "@minecraft/server";

import { toAllPlayers } from "../../../origins/player";
import { findItem } from "../../../utils/items";

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function berry_craver(player) {

  let targetBerry;
  let convertTo;

  if (player.hasTag('power_berry_craver')) {
    targetBerry = findItem(player, 'minecraft:sweet_berries')
    convertTo = 'r4isen1920_originspe:kitsune_sweet_berries'
  } else {
    targetBerry = findItem(player, 'r4isen1920_originspe:kitsune_sweet_berries')
    convertTo = 'minecraft:sweet_berries'
  }

  if (!targetBerry) return;

  player.getComponent('inventory').container.setItem(targetBerry.slot, new ItemStack(convertTo, targetBerry.item.amount))

}

toAllPlayers(berry_craver, 3)
