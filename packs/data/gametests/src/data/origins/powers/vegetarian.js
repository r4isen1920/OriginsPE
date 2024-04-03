
import { ItemStack } from "@minecraft/server";
import { toAllPlayers } from "../../../origins/player";
import { findItem } from "../../../utils/items";


/**
 * 
 * @param { import('@minecraft/server').Player } player 
 * @param { string[] } items 
 * @param { string } replacementNamespace 
 */
export function replaceItems(player, items, replacementNamespace) {
  for (const item of items) {
    const foundItem = findItem(player, item);
    if (foundItem) {
      const foundItemName = foundItem.item.typeId;
      const foundItemNamespace = foundItemName.replace(/(?<=:).+/g, '');
      const newItem = new ItemStack(`${replacementNamespace}${foundItemName.replace(`${foundItemNamespace}uneatable_`, '').replace(foundItemNamespace, '')}`, foundItem.item.amount);
      player.getComponent('inventory').container.setItem(foundItem.slot, newItem);
    }
  }
}

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function vegetarian(player) {
  if (!player.hasTag('power_vegetarian')) return

  const EATABLE_ITEMS = [
    'r4isen1920_originspe:uneatable_apple',
    'r4isen1920_originspe:uneatable_baked_potato',
    'r4isen1920_originspe:uneatable_beetroot',
    'r4isen1920_originspe:uneatable_beetroot_soup',
    'r4isen1920_originspe:uneatable_bread',
    'r4isen1920_originspe:uneatable_carrot',
    'r4isen1920_originspe:uneatable_chorus_fruit',
    'r4isen1920_originspe:uneatable_cookie',
    'r4isen1920_originspe:uneatable_dried_kelp',
    'r4isen1920_originspe:uneatable_enchanted_golden_apple',
    'r4isen1920_originspe:uneatable_glow_berries',
    'r4isen1920_originspe:uneatable_golden_apple',
    'r4isen1920_originspe:uneatable_golden_carrot',
    'r4isen1920_originspe:uneatable_melon_slice',
    'r4isen1920_originspe:uneatable_mushroom_stew',
    'r4isen1920_originspe:uneatable_poisonous_potato',
    'r4isen1920_originspe:uneatable_potato',
    'r4isen1920_originspe:uneatable_pumpkin_pie',
    'r4isen1920_originspe:uneatable_sweet_berries',
  ]

  const UNEATABLE_ITEMS = [
    'minecraft:cooked_chicken',
    'minecraft:cooked_cod',
    'minecraft:cooked_mutton',
    'minecraft:cooked_porkchop',
    'minecraft:cooked_rabbit',
    'minecraft:cooked_salmon',
    'minecraft:pufferfish',
    'minecraft:raw_beef',
    'minecraft:raw_chicken',
    'minecraft:raw_cod',
    'minecraft:mutton',
    'minecraft:raw_porkchop',
    'minecraft:raw_rabbit',
    'minecraft:raw_salmon',
    'minecraft:rotten_flesh',
    'minecraft:spider_eye',
    'minecraft:steak',
    'minecraft:tropical_fish',
  ]

  replaceItems(player, UNEATABLE_ITEMS, 'r4isen1920_originspe:uneatable_');
  replaceItems(player, EATABLE_ITEMS, 'minecraft:');

}

toAllPlayers(vegetarian, 3)
