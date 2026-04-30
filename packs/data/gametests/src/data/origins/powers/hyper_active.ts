
import { ItemStack, Player } from "@minecraft/server";
import { toAllPlayers } from "../../../origins/player";
import { findItem } from "../../../utils/items";


function hyper_active(player: Player) {

  let targetSugar;
  let convertTo;

  if (player.hasTag('power_hyper_active')) {
    targetSugar = findItem(player, 'minecraft:sugar');
    convertTo = 'r4isen1920_originspe:inchling_sugar';
  } else {
    targetSugar = findItem(player, 'r4isen1920_originspe:inchling_sugar');
    convertTo = 'minecraft:sugar';
  }

  const invComp = player.getComponent('inventory');
  if (!targetSugar || !targetSugar.item || !invComp) return;

  const item = targetSugar.item;
  if (item.typeId !== 'minecraft:sugar' && item.typeId !== 'r4isen1920_originspe:inchling_sugar') return;

  invComp.container.setItem(targetSugar.slot, new ItemStack(convertTo, item.amount));

}

toAllPlayers(hyper_active, 3);
