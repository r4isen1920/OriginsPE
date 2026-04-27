
import { EquipmentSlot, ItemLockMode, ItemStack } from "@minecraft/server";

import { toAllPlayers } from "../../../origins/player";
import type { Player } from "@minecraft/server";
import { findItems, findItemsWithLore, getEquipment } from "../../../utils/items";
import { ResourceBar } from "../../../origins/resource_bar";

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function endless_quiver(Player: Player) {
  if (!Player.hasTag('power_endless_quiver')) return;

  const mainhand = getEquipment(Player, EquipmentSlot.Mainhand);
  const hasBowInHand = Array.isArray(mainhand) ? mainhand.some((item) => item.typeId.includes('bow')) : mainhand.typeId.includes('bow');
  if (hasBowInHand) giveArrow(Player);
  else takeArrow(Player);

}

toAllPlayers(endless_quiver, 3)

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function giveArrow(Player: Player) {

  const arrows = findItems(Player, 'minecraft:arrow') || [];

  if (arrows.length === 0) {

    const newArrow = new ItemStack('minecraft:arrow', 1)
    newArrow.lockMode = ItemLockMode.inventory
    newArrow.setLore(['§r§6Endless Quiver§r'])

    const inventory = Player.getComponent('inventory');
    if (!inventory?.container) return;
    inventory.container.addItem(newArrow);

    Player.playSound('note.pling', { volume: 0.1, pitch: 1.75 });
    Player.playSound('mob.chicken.plop', { volume: 0.75 });

    if (!Player.hasTag('cooldown_16')) new ResourceBar(17, 0, 100, 1).push(Player)

  } 

  else if (arrows.length > 1) takeArrow(Player);

}
/*
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function takeArrow(Player: Player) {

  Player.removeTag('cooldown_17');

  const newArrow = findItemsWithLore(Player, 'minecraft:arrow', ['§r§6Endless Quiver§r']);
  if (!newArrow) return;

  const inventory = Player.getComponent('inventory');
  if (!inventory?.container) return;
  inventory.container.setItem(newArrow[0].slot, undefined);

}
