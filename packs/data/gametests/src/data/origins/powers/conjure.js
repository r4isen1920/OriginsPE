
import { ItemStack } from "@minecraft/server";

import { toAllPlayers } from "../../../origins/player";
import { findItem } from "../../../utils/items";

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function conjure(player) {

  let targetBow;
  let convertTo;

  if (player.hasTag('power_conjure')) {
    targetBow = findItem(player, 'minecraft:bow')
    convertTo = 'r4isen1920_originspe:elven_bow'
  } else {
    targetBow = findItem(player, 'r4isen1920_originspe:elven_bow')
    convertTo = 'minecraft:bow'
  }

  if (!targetBow) return;

  player.getComponent('inventory').container.setItem(targetBow.slot, new ItemStack(convertTo, targetBow.item.amount))

}

toAllPlayers(conjure, 3)
