
import { ItemStack, world, system, TicksPerSecond, EquipmentSlot } from "@minecraft/server";

import { toAllPlayers } from "../../../origins/player";
import { findItems } from "../../../utils/items";

/**
 * 
 * Materials of the quality equipment
 */
const templateMaterials = [
  'diamond', 'golden', 'iron',
  'leather', 'netherite', 'stone', 'wooden'
];
/**
 * 
 * Specific types that is used for breaking
 * blocks
 */
const templateDiggableTypes = [
  'axe', 'hoe', 'shovel', 'pickaxe'
]
/**
 * 
 * Types of the armor
 */
const templateArmorTypes = [
  'boots', 'chestplate', 'helmet', 'leggings'
]
/**
 * 
 * All types of the 
 * quality equipment combined
 */
const templateTypes = [
  'sword',
  ...templateDiggableTypes,
  ...templateArmorTypes
];

/**
 * 
 * List of items
 */
const items = [

  ...templateMaterials.flatMap(material => 
    templateTypes.map(type => `r4isen1920_originspe:temp_${material}_${type}`)
  )

]

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function quality_equipment(player) {
  const foodItemsInInventory = findItems(player).filter(item => items.includes(item?.item?.typeId))
  if (foodItemsInInventory.length === 0) return;

  for (const item of foodItemsInInventory) {
    const baseTypeId = item.item.typeId.replace('r4isen1920_originspe:temp_', '');
    const newItemTypeId = player.hasTag('class_blacksmith') ? `r4isen1920_originspe:blacksmith_${baseTypeId}` : `minecraft:${baseTypeId}`;
    const newItem = new ItemStack(newItemTypeId, item.item.amount);

    let setLore = [];
    if (templateArmorTypes.some(type => baseTypeId.includes(type) && baseTypeId.includes('netherite'))) 
      setLore.push('§r§7', '§r§9+1 Knockback Resistance§r');
    if (player.hasTag('class_blacksmith')) setLore.push('§r§6Quality Equipment§r');
    newItem.setLore(setLore);

    player.getComponent('inventory').container.setItem(item.slot, newItem);
  }
  if (player.hasTag('class_blacksmith')) player.playSound('smithing_table.use', { volume: 0.75, pitch: 1.25 })

}

toAllPlayers(quality_equipment, 15, TicksPerSecond * 15)


/**
 * 
 * Run the effects of quality
 * equipments
 */
system.runTimeout(() => {

  world.afterEvents.playerBreakBlock.subscribe(
    event => {

      const { block, brokenBlockPermutation, itemStackBeforeBreak } = event;
      if (
        !items.some(i => itemStackBeforeBreak?.typeId?.includes(i.replace('r4isen1920_originspe:temp_', ''))) ||
        !templateDiggableTypes.some(i => itemStackBeforeBreak?.typeId?.includes(i)) ||
        !itemStackBeforeBreak?.getLore()?.includes('§r§6Quality Equipment§r')
      ) return

      const cropTypes = [
        'wheat', 'beetroot', 'carrots', 'potatoes', 'melon_stem', 'pumpkin_stem', 'sweet_berry_bush', 'nether_wart'
      ]
      const isCropBlock = cropTypes.some(type => brokenBlockPermutation.matches(`minecraft:${type}`))

      block.dimension.spawnParticle(
        `r4isen1920_originspe:blacksmiths_${isCropBlock ? 'harvest' : 'dig'}`, 
        block.center()
      )

    }
  )

}, TicksPerSecond * 11)
