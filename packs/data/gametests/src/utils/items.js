
import { EquipmentSlot, ItemStack } from "@minecraft/server";


/**
 * 
 * @author
 * r4isen1920
 * 
 * @remarks
 * Returns all items found within
 * the entity's inventory in an
 * array, optionally filtered by item type
 * otherwise returns all items
 * 
 * @param { import("@minecraft/server").Entity } entity 
 * @param { import("@minecraft/server").ItemStack | 'all' } item 
 * @returns { Array<{ item: import("@minecraft/server").ItemStack, slot: number }> }
 */
export function findItems(entity, item='all') {
  let _A = [];

  const inventory = entity.getComponent('inventory');
  if (!inventory) return false;

  const inventoryContainer = inventory.container;

  for (let i = 0; i < inventoryContainer.size; i++) {
    const itemStack = inventoryContainer.getItem(i);
    if (item === 'all') _A.push({ item: itemStack, slot: i });
    else if (itemStack?.typeId.includes(item)) {
      _A.push({ item: itemStack, slot: i });
    }
  }

  return _A;
}


/**
 * 
 * @author
 * r4isen1920
 * 
 * @remarks
 * Returns the specified item
 * if found within the entity's inventory,
 * otherwise return false
 * 
 * @param { import("@minecraft/server").Entity } entity 
 * @param { import("@minecraft/server").ItemStack } item 
 * @returns { { item: import("@minecraft/server").ItemStack, slot: number } | false }
 */
export function findItem(entity, item) {
  return findItems(entity, item)[0] || false;
}


/**
 * 
 * @author
 * r4isen1920
 * 
 * @remarks
 * Returns the specified items
 * if found within the entity's inventory
 * with the specified lore, otherwise
 * return false
 * 
 * @param { import("@minecraft/server").Entity } entity 
 * @param { import("@minecraft/server").ItemStack } item 
 * @param { string[] } lore 
 * 
 * @returns { { item: import("@minecraft/server").ItemStack, slot: number }[] | false }
 */
export function findItemsWithLore(entity, item, lore) {
  const _A = findItems(entity, item).filter(x => x.item.getLore().some(y => lore.some(z => y.includes(z))));
  return _A.length > 0 ? _A : false;
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
  return findItems(entity, itemKey).length > 0;
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
 * in the player's equipment with
 * the provided slot, returns all
 * slots otherwise.
 * 
 * @param { import('@minecraft/server').Player } player 
 * @param { import('@minecraft/server').EquipmentSlot | 'all' } slot 
 * 
 * @returns { import('@minecraft/server').ItemStack | import('@minecraft/server').ItemStack[] }
 */
export function getEquipment(player, slot='all') {

  /**
   * @type { import('@minecraft/server').EntityEquippableComponent }
   */
  const equipment = player.getComponent('equippable');

  let _A;

  if (slot === 'all') {
    _A = [
      equipment.getEquipment(EquipmentSlot.Head) || new ItemStack('minecraft:air'),
      equipment.getEquipment(EquipmentSlot.Chest) || new ItemStack('minecraft:air'),
      equipment.getEquipment(EquipmentSlot.Legs) || new ItemStack('minecraft:air'),
      equipment.getEquipment(EquipmentSlot.Feet) || new ItemStack('minecraft:air'),
      equipment.getEquipment(EquipmentSlot.Mainhand) || new ItemStack('minecraft:air'),
      equipment.getEquipment(EquipmentSlot.Offhand) || new ItemStack('minecraft:air'),
    ]
  } else _A = equipment.getEquipment(slot) || new ItemStack('minecraft:air')

  return _A

}
