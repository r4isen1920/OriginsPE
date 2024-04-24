
import { EquipmentSlot, ItemLockMode, ItemStack } from "@minecraft/server";

import { toAllPlayers } from "../../../origins/player";
import { findItems, findItemsWithLore, getEquipment } from "../../../utils/items";
import { ResourceBar } from "../../../origins/resource_bar";

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function endless_quiver(player) {
  if (!player.hasTag('power_endless_quiver')) return;

  const hasBowInHand = getEquipment(player, EquipmentSlot.Mainhand).typeId.includes('bow');
  if (hasBowInHand) giveArrow(player);
  else takeArrow(player);

}

toAllPlayers(endless_quiver, 3)

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function giveArrow(player) {

  const arrows = findItems(player, 'minecraft:arrow');

  if (arrows.length === 0) {

    const newArrow = new ItemStack('minecraft:arrow', 1)
    newArrow.lockMode = ItemLockMode.inventory
    newArrow.setLore(['§r§6Endless Quiver§r'])
    player.getComponent('inventory').container.addItem(newArrow);

    player.playSound('note.pling', { volume: 0.1, pitch: 1.75 });
    player.playSound('mob.chicken.plop', { volume: 0.75 });

    if (!player.hasTag('cooldown_16')) new ResourceBar(17, 0, 100, 1).push(player)

  } 

  else if (arrows.length > 1) takeArrow(player);

}

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function takeArrow(player) {

  player.removeTag('cooldown_17');

  const newArrow = findItemsWithLore(player, 'minecraft:arrow', ['§r§6Endless Quiver§r']);
  if (!newArrow) return;

  player.getComponent('inventory').container.setItem(newArrow[0].slot, undefined);

}
