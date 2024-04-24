
import { ItemStack } from '@minecraft/server';

import { toAllPlayers } from '../../../origins/player';

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 * @returns 
 */
function explorer_kit(player) {
  if (
    !player.hasTag('perk_explorer_kit') ||
    player.hasTag('explorer_kit_given')
  ) return;

  const itemsToGive = [
    'minecraft:compass',
    'minecraft:clock',
    {
      typeId: 'minecraft:empty_map',
      amount: 9
    }
  ]

  /**
   * @type { import('@minecraft/server').Container }
   */
  const playerInventory = player.getComponent('inventory').container

  itemsToGive.forEach(item => {
    let newItem;
    if (typeof item === 'string') {
      newItem = new ItemStack(item)
    } else {
      newItem = new ItemStack(item.typeId, item.amount)
    }

    newItem.setLore(['§r§6Explorer Kit§r'])
    newItem.keepOnDeath = true;
    playerInventory.addItem(newItem)
  })

  player.addTag('explorer_kit_given')

}

toAllPlayers(explorer_kit, 10);
