
import { EquipmentSlot, ItemLockMode, ItemStack, Player } from "@minecraft/server";

import { toAllPlayers } from "../../../origins/player";
import { findItems, findItemsWithLore, getEquipment } from "../../../utils/items";
import { ResourceBar } from "../../../origins/resource_bar";


function endless_quiver(player: Player) {
  if (!player.hasTag('power_endless_quiver')) return;

  const mainhand = getEquipment(player, EquipmentSlot.Mainhand);
  const hasBowInHand = Array.isArray(mainhand) ? mainhand.some((item) => item.typeId.includes('bow')) : mainhand.typeId.includes('bow');
  if (hasBowInHand) giveArrow(player);
  else takeArrow(player);

}

toAllPlayers(endless_quiver, 3);

function giveArrow(player: Player) {

  const arrows = findItems(player, 'minecraft:arrow') || [];

  if (arrows.length === 0) {

    const newArrow = new ItemStack('minecraft:arrow', 1);
    newArrow.lockMode = ItemLockMode.inventory;
    newArrow.setLore(['§r§6Endless Quiver§r']);

    const inventory = player.getComponent('inventory');
    if (!inventory?.container) return;
    inventory.container.addItem(newArrow);

    player.playSound('note.pling', { volume: 0.1, pitch: 1.75 });
    player.playSound('mob.chicken.plop', { volume: 0.75 });

    if (!player.hasTag('cooldown_16')) new ResourceBar(17, 0, 100, 1).push(player);

  } 

  else if (arrows.length > 1) takeArrow(player);

}

function takeArrow(player: Player) {

  player.removeTag('cooldown_17');

  const newArrow = findItemsWithLore(player, 'minecraft:arrow', ['§r§6Endless Quiver§r']);
  if (!newArrow) return;

  const inventory = player.getComponent('inventory');
  if (!inventory?.container) return;
  inventory.container.setItem(newArrow[0].slot, undefined);

}
