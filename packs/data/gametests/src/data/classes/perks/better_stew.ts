
import { ItemStack, world, system, TicksPerSecond, Player } from "@minecraft/server";

import { toAllPlayers } from "../../../origins/player";
import { findItems } from "../../../utils/items";

const items = [

  'r4isen1920_originspe:temp_mushroom_stew',
  'r4isen1920_originspe:temp_rabbit_stew',

];

/**
 *
 * make stews better by giving them a regeneration effect
 * and a different name/lore
 * 
 */

function better_stew(player: Player) {
  const inventoryItems = findItems(player);
  if (!inventoryItems) return;

  const foodItemsInInventory = inventoryItems.filter((item): item is typeof item & { item: { typeId: string } } => item?.item?.typeId !== undefined && items.includes(item.item.typeId));
  if (foodItemsInInventory.length === 0) return;

  for (const item of foodItemsInInventory) {
    const convertItem = new ItemStack(item.item.typeId.replace('r4isen1920_originspe:temp_', 'minecraft:'), item.item.amount);
    if (player.hasTag('class_cook')) convertItem.setLore(['§r§6Rejuvenating Soup§r']);
    const inventoryComponent = player.getComponent('minecraft:inventory');
    if (inventoryComponent) {
      inventoryComponent.container.setItem(item.slot, convertItem);
    }
  }
  if (player.hasTag('class_cook')) player.playSound('random.cook');

}

toAllPlayers(better_stew, 15, TicksPerSecond * 15);


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
        !itemStack.getLore().includes('§r§6Rejuvenating Soup§r')
      ) return;

      source.addEffect('regeneration', TicksPerSecond * 12, { amplifier: 1 });

    }
  );

}, TicksPerSecond * 11);
