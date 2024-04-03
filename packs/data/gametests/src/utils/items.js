
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
  if (inventory == undefined) return false;

  const inventorySize = inventory.inventorySize;
  const inventoryContainer = inventory.container;

  for (let i = 0; i < inventorySize; i++) {
    const itemStack = inventoryContainer.getItem(i);
    if (!itemStack?.typeId.includes(itemKey)) continue;
    if (itemStack.typeId.includes(itemKey)) {
      return true;
    }
  }
}
