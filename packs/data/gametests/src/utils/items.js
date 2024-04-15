
import { EquipmentSlot, ItemStack } from "@minecraft/server";

/**
 * 
 * @author
 * r4isen1920
 * 
 * @remarks
 * Returns the specified item
 * if found within the entity's inventory
 * 
 * @param { import("@minecraft/server").Entity } entity 
 * @param { import("@minecraft/server").ItemStack } item 
 * @returns { { item: import("@minecraft/server").ItemStack, slot: number } | false }
 */
export function findItem(entity, item) {
  const inventory = entity.getComponent('inventory');
  if (!inventory) return false;

  const inventoryContainer = inventory.container;

  for (let i = 0; i < inventoryContainer.size; i++) {
    const itemStack = inventoryContainer.getItem(i);
    if (itemStack?.typeId.includes(item)) {
      return { item: itemStack, slot: i };
    }
  }

  return false;
}


/**
 * 
 * @author
 * r4isen1920
 * 
 * @remarks
 * Returns true if the specified rough
 * item name keyword is found within
 * the entity's inventory
 * 
 * @param { import("@minecraft/server").Entity } entity 
 * @param { string } itemKey 
 * @returns boolean
 */
export function searchItemId(entity, itemKey) {
  const inventory = entity.getComponent('inventory');
  if (!inventory) return false;

  const inventoryContainer = inventory.container;

  for (let i = 0; i < inventoryContainer.size; i++) {
    const itemStack = inventoryContainer.getItem(i);
    if (itemStack?.typeId.includes(itemKey)) {
      return true;
    }
  }

  return false;
}

/**
 * 
 * @author
 * r4isen1920
 * 
 * @remarks
 * Returns an array of all items
 * in the player's inventory that
 * is enumerable in nature with 
 * their typeId and amount
 * 
 * @param { import('@minecraft/server').Player } player 
 * 
 * @returns { Array<{ typeId: string, amount: number }> }
 */
export function getItemsCountInInventory(player) {

  /**
   * @type { import('@minecraft/server').Container }
   */
  const container = player.getComponent('inventory').container

  return Array.from({ length: container.size }, (_, i) => {
    const item = container.getItem(i);
    return item ? { typeId: item.typeId, amount: item.amount } : null;
  }).filter(item => item !== null);
}

/**
 * 
 * @author
 * r4isen1920
 * 
 * @remarks
 * Returns an array of all items
 * in the player's equipment
 * 
 * @param { import('@minecraft/server').Player } player 
 * 
 * @returns { import('@minecraft/server').ItemStack[] }
 */
export function getEquipment(player) {

  /**
   * @type { import('@minecraft/server').EntityEquippableComponent }
   */
  const equipment = player.getComponent('equippable');

  return [
    equipment.getEquipment(EquipmentSlot.Head) || new ItemStack('minecraft:air'),
    equipment.getEquipment(EquipmentSlot.Chest) || new ItemStack('minecraft:air'),
    equipment.getEquipment(EquipmentSlot.Legs) || new ItemStack('minecraft:air'),
    equipment.getEquipment(EquipmentSlot.Feet) || new ItemStack('minecraft:air'),
    equipment.getEquipment(EquipmentSlot.Mainhand) || new ItemStack('minecraft:air'),
    equipment.getEquipment(EquipmentSlot.Offhand) || new ItemStack('minecraft:air'),
  ]

}
