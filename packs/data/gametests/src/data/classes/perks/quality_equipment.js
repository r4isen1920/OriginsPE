
import { ItemStack, world, system, TicksPerSecond, EquipmentSlot } from "@minecraft/server";

import { toAllPlayers } from "../../../origins/player";
import { findItems } from "../../../utils/items";

const is_blacksmith_class_item = "r4isen1920_originspe:blacksmith_"
const is_quality_set_property = 'is_quality_set'

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
    templateTypes.map(type => `minecraft:${material}_${type}`)
  )
]

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function quality_equipment(player) {
  const unsetItemsInInventory = findItems(player).filter(item => items.includes(item?.item?.typeId) && !item?.item?.getDynamicProperty(is_quality_set_property))

  if (unsetItemsInInventory.length === 0) return;

  for (const item of unsetItemsInInventory) {
    const baseTypeId = item.item.typeId.replace('minecraft:', '');
    const newItemTypeId = player.hasTag('class_blacksmith') ? `r4isen1920_originspe:blacksmith_${baseTypeId}` : `minecraft:${baseTypeId}`;
    const newItem = new ItemStack(newItemTypeId, item.item.amount);

    let setLore = [];
    if (templateArmorTypes.some(type => baseTypeId.includes(type) && baseTypeId.includes('netherite'))) 
      setLore.push('§r§7', '§r§9+1 Knockback Resistance§r');
    if (player.hasTag('class_blacksmith')) setLore.push('§r§6Quality Equipment§r');
    newItem.setLore(setLore);

    // If this property is not set, tools made by non-blacksmith players may be converted to Quality Equiptment when it enters a blacksmith's inventory
    newItem.setDynamicProperty(is_quality_set_property, true)

    player.getComponent('inventory').container.setItem(item.slot, newItem);

  }
  if (player.hasTag('class_blacksmith')) player.playSound('smithing_table.use', { volume: 0.75, pitch: 1.25 })

}

toAllPlayers(quality_equipment, 15, TicksPerSecond * 15)


/**
 * Runs the effects of quality equipment.
 */
system.runTimeout(() => {
  world.afterEvents.playerBreakBlock.subscribe(event => {
    const { block, brokenBlockPermutation, itemStackBeforeBreak, player } = event;

    if (!isValidQualityEquipment(itemStackBeforeBreak)) return;

    if (itemStackBeforeBreak?.typeId.includes(is_blacksmith_class_item)) {
      handleDurability(itemStackBeforeBreak, player);
    }

    spawnBreakParticles(block, brokenBlockPermutation);
  });
}, TicksPerSecond * 11);


/**
 * Checks if the broken item is a valid piece of quality equipment.
 */
function isValidQualityEquipment(itemStack) {
  return (
    itemStack &&
    items.some(i => itemStack.typeId.includes(i.replace("minecraft:", ""))) &&
    templateDiggableTypes.some(i => itemStack.typeId.includes(i)) &&
    itemStack.getLore()?.includes("§r§6Quality Equipment§r")
  );
}

/**
 * Handles durability logic, including applying damage and removing the item if it breaks.
 */
function handleDurability(itemStack, player) {
  const durability = itemStack.getComponent("durability");
  if (!durability) return;

  const damageAmount = calculateDurabilityLoss(durability);

  updateInventory(itemStack, durability, player, damageAmount);
}

/**
 * Determines how much durability should be lost, based on Minecraft's damage chance logic.
 */
function calculateDurabilityLoss(durability) {

  const damageChance = durability.getDamageChanceRange();

  const max = damageChance.max || 1
  const min = damageChance.min || 1

  // Apply damage based on Minecraft's logic
  let damageAmount = 0;

  // If min === max, apply damage 100% of the time
  if (min === max) {
    damageAmount = min;
  } else {
    // If min !== max, we need to implement the probability logic
    const randomRoll = Math.floor(Math.random() * max) + 1; // Random number from 1 to max
    if (randomRoll === min) {
      damageAmount = min; // 50% chance of taking damage
    }
  }

  return damageAmount
}

/**
 * Finds the item in the inventory, updates durability, or removes it if it is broken.
 */
function updateInventory(itemStack, durability, player, damageAmount) {
  const inventory = player.getComponent("inventory").container;
  let itemSlot = -1;

  for (let i = 0; i < inventory.size; i++) {
     const currentItem = inventory.getItem(i);
     if (currentItem && currentItem.typeId === itemStack.typeId) {
       const currentDurability = currentItem.getComponent("durability");
       
       // ✅ Match the item based on its durability value
       if (currentDurability && currentDurability.damage === durability.damage) {
         itemSlot = i;
         break;
       }
     }
   }

  if (itemSlot === -1) return;

  durability.damage += Math.min(damageAmount, durability.maxDurability - durability.damage);

  if (durability.damage >= durability.maxDurability) {
    // Item Broke
    player.playSound("random.break", { volume: 1.0, pitch: 1.0 });
    inventory.setItem(itemSlot, undefined);
  } else {
    inventory.setItem(itemSlot, itemStack);
  }
}

/**
 * Spawns particle effects based on the type of block broken.
 */
function spawnBreakParticles(block, brokenBlockPermutation) {
  const cropTypes = [
    "wheat", "beetroot", "carrots", "potatoes", "melon_stem", "pumpkin_stem",
    "sweet_berry_bush", "nether_wart"
  ];
  const isCropBlock = cropTypes.some(type => brokenBlockPermutation.matches(`minecraft:${type}`));

  block.dimension.spawnParticle(
    `r4isen1920_originspe:blacksmiths_${isCropBlock ? "harvest" : "dig"}`,
    block.center()
  );
}
