

import { toAllPlayers } from "../../../origins/player";
import { replaceItems } from "./vegetarian";

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function carnivore(player) {
  if (!player.hasTag('power_carnivore')) return

  const EATABLE_ITEMS = [
    'r4isen1920_originspe:uneatable_cooked_chicken',
    'r4isen1920_originspe:uneatable_cooked_cod',
    'r4isen1920_originspe:uneatable_cooked_mutton',
    'r4isen1920_originspe:uneatable_cooked_porkchop',
    'r4isen1920_originspe:uneatable_cooked_rabbit',
    'r4isen1920_originspe:uneatable_cooked_salmon',
    'r4isen1920_originspe:uneatable_pufferfish',
    'r4isen1920_originspe:uneatable_raw_beef',
    'r4isen1920_originspe:uneatable_raw_chicken',
    'r4isen1920_originspe:uneatable_raw_cod',
    'r4isen1920_originspe:uneatable_mutton',
    'r4isen1920_originspe:uneatable_raw_porkchop',
    'r4isen1920_originspe:uneatable_raw_rabbit',
    'r4isen1920_originspe:uneatable_raw_salmon',
    'r4isen1920_originspe:uneatable_rotten_flesh',
    'r4isen1920_originspe:uneatable_spider_eye',
    'r4isen1920_originspe:uneatable_steak',
    'r4isen1920_originspe:uneatable_tropical_fish',
  ]

  const UNEATABLE_ITEMS = [
    'minecraft:apple',
    'minecraft:baked_potato',
    'minecraft:beetroot',
    'minecraft:beetroot_soup',
    'minecraft:bread',
    'minecraft:carrot',
    'minecraft:chorus_fruit',
    'minecraft:cookie',
    'minecraft:dried_kelp',
    'minecraft:enchanted_golden_apple',
    'minecraft:glow_berries',
    'minecraft:golden_apple',
    'minecraft:golden_carrot',
    'minecraft:melon_slice',
    'minecraft:mushroom_stew',
    'minecraft:poisonous_potato',
    'minecraft:potato',
    'minecraft:pumpkin_pie',
    'minecraft:sweet_berries',
  ]

  replaceItems(player, UNEATABLE_ITEMS, 'r4isen1920_originspe:uneatable_');
  replaceItems(player, EATABLE_ITEMS, 'minecraft:');

}

toAllPlayers(carnivore, 3)
