
import { ItemStack, world, system, TicksPerSecond } from "@minecraft/server";

import { toAllPlayers } from "../../../origins/player";
import { findItems } from "../../../utils/items";

const items = [

  'r4isen1920_originspe:temp_mushroom_stew',
  'r4isen1920_originspe:temp_rabbit_stew',

]

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function better_stew(player) {
  const foodItemsInInventory = findItems(player).filter(item => items.includes(item?.item?.typeId))
  if (foodItemsInInventory.length === 0) return;

  for (const item of foodItemsInInventory) {
    const convertItem = new ItemStack(item.item.typeId.replace('r4isen1920_originspe:temp_', 'minecraft:'), item.item.amount)
    if (player.hasTag('perk_better_stew')) convertItem.setLore(['§r§6Enhanced by a Cook§r'])
    player.getComponent('inventory').container.setItem(item.slot, convertItem)
  }
  if (player.hasTag('perk_better_stew')) player.playSound('random.cook')

}

toAllPlayers(better_stew, 15)


/**
 * 
 * Run the effects of better stews
 */
system.runTimeout(() => {

  world.afterEvents.itemCompleteUse.subscribe(
    event => {

      const { itemStack, source } = event;
      if (
        !items.some(i => itemStack.typeId.includes(i.replace('r4isen1920_originspe:temp_', ''))) ||
        !itemStack.getLore().includes('§r§6Enhanced by a Cook§r')
      ) return

      source.addEffect('regeneration', TicksPerSecond * 12, { amplifier: 1 });

    }
  )

}, TicksPerSecond * 11)
