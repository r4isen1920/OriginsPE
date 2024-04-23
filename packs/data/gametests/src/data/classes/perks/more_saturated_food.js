
import { ItemStack, system, TicksPerSecond, world } from "@minecraft/server";

import { toAllPlayers } from "../../../origins/player";
import { findItems } from "../../../utils/items";

const items = [

  'r4isen1920_originspe:temp_baked_potato',
  'r4isen1920_originspe:temp_beetroot_soup',
  'r4isen1920_originspe:temp_bread',
  'r4isen1920_originspe:temp_cooked_beef',
  'r4isen1920_originspe:temp_cooked_chicken',
  'r4isen1920_originspe:temp_cooked_cod',
  'r4isen1920_originspe:temp_cooked_mutton',
  'r4isen1920_originspe:temp_cooked_porkchop',
  'r4isen1920_originspe:temp_cooked_rabbit',
  'r4isen1920_originspe:temp_cooked_salmon',
  'r4isen1920_originspe:temp_dried_kelp',

]

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function more_saturated_food(player) {
  const foodItemsInInventory = findItems(player).filter(item => items.includes(item?.item?.typeId))
  if (foodItemsInInventory.length === 0) return;

  for (const item of foodItemsInInventory) {
    const convertItem = new ItemStack(item.item.typeId.replace('r4isen1920_originspe:temp_', 'minecraft:'), item.item.amount)
    if (player.hasTag('perk_more_saturated_food')) convertItem.setLore(['§r§6Enhanced by a Cook§r'])
    player.getComponent('inventory').container.setItem(item.slot, convertItem)
  }
  if (player.hasTag('perk_more_saturated_food')) player.playSound('random.cook')

}

toAllPlayers(more_saturated_food, 15)


/**
 * 
 * Run the effects of better food
 */
system.runTimeout(() => {

  world.afterEvents.itemCompleteUse.subscribe(
    event => {

      const { itemStack, source } = event;
      if (
        !items.some(i => itemStack.typeId.includes(i.replace('r4isen1920_originspe:temp_', ''))) ||
        !itemStack.getLore().includes('§r§6Enhanced by a Cook§r')
      ) return

      source.addEffect('saturation', TicksPerSecond, { amplifier: 1 });

    }
  )

}, TicksPerSecond * 11)
