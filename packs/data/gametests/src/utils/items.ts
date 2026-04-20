import {
  Entity,
  Player,
  ItemStack,
  EquipmentSlot,
  Container,
  EntityInventoryComponent,
  EntityEquippableComponent,
} from "@minecraft/server";

/** Represents an item found in an inventory slot */
interface InventoryItem {
  item: ItemStack | undefined;
  slot: number;
}

/** Represents a counted item in inventory */
interface CountedItem {
  typeId: string;
  amount: number;
}

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
 */
export function findItems(
  entity: Entity,
  item: string = "all",
): InventoryItem[] | false {
  const _A: InventoryItem[] = [];

  const inventory = entity.getComponent("inventory") as
    | EntityInventoryComponent
    | undefined;
  if (!inventory) return false;

  const inventoryContainer = inventory.container as Container;

  for (let i = 0; i < inventoryContainer.size; i++) {
    const itemStack = inventoryContainer.getItem(i);
    if (item === "all") _A.push({ item: itemStack, slot: i });
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
 */
export function findItem(entity: Entity, item: string): InventoryItem | false {
  const items = findItems(entity, item);
  if (items === false) return false;
  return items[0] || false;
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
 */
export function findItemsWithLore(
  entity: Entity,
  item: string,
  lore: string[],
): InventoryItem[] | false {
  const items = findItems(entity, item);
  if (items === false) return false;

  const _A = items.filter((x) =>
    x.item?.getLore().some((y) => lore.some((z) => y.includes(z))),
  );
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
 */
export function searchItemId(entity: Entity, itemKey: string): boolean {
  const items = findItems(entity, itemKey);
  if (items === false) return false;
  return items.length > 0;
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
 */
export function getItemsCountInInventory(player: Player): CountedItem[] {
  const inventory = player.getComponent(
    "inventory",
  ) as EntityInventoryComponent;
  const container = inventory.container as Container;

  return Array.from({ length: container.size }, (_, i) => {
    const item = container.getItem(i);
    return item ? { typeId: item.typeId, amount: item.amount } : null;
  }).filter((item): item is CountedItem => item !== null);
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
 */
export function getEquipment(
  player: Player,
  slot: EquipmentSlot | "all" = "all",
): ItemStack | ItemStack[] {
  const equipment = player.getComponent(
    "equippable",
  ) as EntityEquippableComponent;

  let _A: ItemStack | ItemStack[];

  if (slot === "all") {
    _A = [
      equipment.getEquipment(EquipmentSlot.Head) ||
        new ItemStack("minecraft:air"),
      equipment.getEquipment(EquipmentSlot.Chest) ||
        new ItemStack("minecraft:air"),
      equipment.getEquipment(EquipmentSlot.Legs) ||
        new ItemStack("minecraft:air"),
      equipment.getEquipment(EquipmentSlot.Feet) ||
        new ItemStack("minecraft:air"),
      equipment.getEquipment(EquipmentSlot.Mainhand) ||
        new ItemStack("minecraft:air"),
      equipment.getEquipment(EquipmentSlot.Offhand) ||
        new ItemStack("minecraft:air"),
    ];
  } else _A = equipment.getEquipment(slot) || new ItemStack("minecraft:air");

  return _A;
}
