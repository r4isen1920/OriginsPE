
import { toAllPlayers } from "../../../origins/player";
import { ResourceBar } from "../../../origins/resource_bar";
import { getEquipment, getItemsCountInInventory } from "../../../utils/items";
import { removeTags } from "../../../utils/tags";

// TODO: fix init when changing Origins

/**
 * 
 * Returns a list of valid
 * items that increases the
 * value of the defense
 * mitigated by the pride
 * ability.
 */
const goldItems = [
  {
    typeId: 'minecraft:golden_helmet',
    value: 0.5
  },
  {
    typeId: 'minecraft:golden_chestplate',
    value: 0.7
  },
  {
    typeId: 'minecraft:golden_leggings',
    value: 0.7
  },
  {
    typeId: 'minecraft:golden_boots',
    value: 0.4
  },
  {
    typeId: 'minecraft:golden_sword',
    value: 0.2
  },
  {
    typeId: 'minecraft:golden_axe',
    value: 0.3
  },
  {
    typeId: 'minecraft:golden_pickaxe',
    value: 0.3
  },
  {
    typeId: 'minecraft:golden_shovel',
    value: 0.1
  },
  {
    typeId: 'minecraft:golden_hoe',
    value: 0.2
  },
  {
    typeId: 'minecraft:gold_block',
    value: 0.9
  },
  {
    typeId: 'minecraft:gold_ingot',
    value: 0.1
  },
  {
    typeId: 'minecraft:gold_nugget',
    value: 0.0111111111111111
  }
]

/**
 * 
 * Returns a list of valid
 * wearables that increases
 * the value of the defense
 * mitigated by the pride
 * ability.
 */
const goldWearables = [
  {
    typeId: 'minecraft:golden_helmet',
    value: 15
  },
  {
    typeId: 'minecraft:golden_chestplate',
    value: 15
  },
  {
    typeId: 'minecraft:golden_leggings',
    value: 15
  },
  {
    typeId: 'minecraft:golden_boots',
    value: 15
  }
]

/**
 * @param {number} value 
 * @param {number} max 
 * @returns {number}
 */
const normalize = function(value=0, max=60) {
  return (value / max) * 100
}

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 */



function pride(player) {
  if (!player.hasTag('power_pride')) return

  const inventoryItems = getItemsCountInInventory(player);
  const goldArmorTypes = goldWearables.map(item => item.typeId);
  const goldArmorInInventory = inventoryItems.filter(item => goldArmorTypes.includes(item.typeId));

  const goldItemsInInventory = inventoryItems.filter(item => goldItems.some(goldItem => goldItem.typeId === item.typeId));
  const totalGold = Math.min(goldItemsInInventory.reduce((total, item) => total + (item.amount * goldItems.find(goldItem => goldItem.typeId === item.typeId).value), 0), 60);

  const wornEquipments = getEquipment(player).map(item => ({
    typeId: item.typeId,
    value: goldWearables.find(goldItem => goldItem.typeId === item.typeId)?.value || 0
  }));

  const prevValue = parseInt(player.getTags()?.filter(tag => tag?.startsWith('_dmg_reduce_value_'))[0]?.split('_dmg_reduce_value_')[1]);
  const currentValue = Math.round(totalGold + wornEquipments.reduce((total, item) => total + item.value, 0))

  if (prevValue === undefined) { player.addTag('_dmg_reduce_value_0'); return }

  if (!player.hasTag('_init_bar')) {
    new ResourceBar(15, normalize(currentValue, 60), normalize(currentValue, 60), 1, true)
        .push(player)

    player.addTag('_init_bar');
    return
  }

  if (prevValue !== currentValue) {
    removeTags(player, '_dmg_reduce_value_')
    player.addTag('_dmg_reduce_value_' + currentValue)

    if (currentValue > 0) {
      new ResourceBar(15, normalize(prevValue, 60) || 0, normalize(currentValue, 60), 1, true)
          .push(player)
    } else {
      new ResourceBar(15, normalize(prevValue, 60) || 0, 0, 1)
          .pop(player)
    }

  }
   if (currentValue > 1 && goldArmorInInventory.length > 0) {
    player.runCommandAsync('tellraw @s {"rawtext":[{"text":"You must WEAR your gold armor for damage reduction!"}]}');
  } else if (currentValue < 1 && goldArmorInInventory.length === 0) {
    player.runCommandAsync('tellraw @s {"rawtext":[{"text":"You must CRAFT your gold armor for damage reduction!"}]}');
  }
}

toAllPlayers(pride, 5)
