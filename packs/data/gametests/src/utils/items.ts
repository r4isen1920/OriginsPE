import {
  Entity,
  Player,
  ItemStack,
  EquipmentSlot,
  Container,
  EntityInventoryComponent,
  EntityEquippableComponent,
} from "@minecraft/server";

interface InventoryItem {
  item: ItemStack | undefined;
  slot: number;
}

interface CountedItem {
  typeId: string;
  amount: number;
}

export function findItems(
  entity: Entity,
  item: string = "all",
): InventoryItem[] | false {
  const inventory = entity.getComponent("inventory") as
    | EntityInventoryComponent
    | undefined;
  if (!inventory) return false;

  const container = inventory.container as Container;
  const size = container.size;

  const results: InventoryItem[] = [];

  for (let i = 0; i < size; i++) {
    const itemStack = container.getItem(i);

    if (item === "all") {
      results.push({ item: itemStack, slot: i });
    } else if (itemStack?.typeId.includes(item)) {
      results.push({ item: itemStack, slot: i });
    }
  }
  return results;
}

export function findItem(entity: Entity, item: string): InventoryItem | false {
  const inventory = entity.getComponent("inventory") as
    | EntityInventoryComponent
    | undefined;
  if (!inventory) return false;

  const container = inventory.container as Container;
  const size = container.size;

  for (let i = 0; i < size; i++) {
    const itemStack = container.getItem(i);
    if (itemStack?.typeId.includes(item)) {
      return { item: itemStack, slot: i };
    }
  }

  return false;
}

export function findItemsWithLore(
  entity: Entity,
  item: string,
  lore: string[],
): InventoryItem[] | false {
  const items = findItems(entity, item);
  if (!items) return false;

  const loreSet = new Set(lore);

  const results = items.filter((x) =>
    x.item?.getLore().some((y) => lore.some((z) => y.includes(z))),
  );
  return results.length > 0 ? results : false;
}

export function searchItemId(entity: Entity, itemKey: string): boolean {
  const inventory = entity.getComponent("inventory") as
    | EntityInventoryComponent
    | undefined;
  if (!inventory) return false;

  const container = inventory.container as Container;
  const size = container.size;

  for (let i = 0; i < size; i++) {
    const itemStack = container.getItem(i);
    if (itemStack?.typeId.includes(itemKey)) return true;
  }

  return false;
}

export function getItemsCountInInventory(player: Player): CountedItem[] {
  const inventory = player.getComponent(
    "inventory",
  ) as EntityInventoryComponent;
  const container = inventory.container as Container;
  const size = container.size;
  const results: CountedItem[] = [];

  for (let i = 0; i < size; i++) {
    const item = container.getItem(i);

    if (item) results.push({ typeId: item.typeId, amount: item.amount });
  }

  return results;
}

export function getEquipment(
  player: Player,
  slot: EquipmentSlot | "all" = "all",
): ItemStack | ItemStack[] {
  const equipment = player.getComponent(
    "equippable",
  ) as EntityEquippableComponent;
  const air = () => new ItemStack("minecraft:air");

  if (slot !== "all") {
    return equipment.getEquipment(slot) ?? air();
  }

  return [
    EquipmentSlot.Head,
    EquipmentSlot.Chest,
    EquipmentSlot.Legs,
    EquipmentSlot.Feet,
    EquipmentSlot.Mainhand,
    EquipmentSlot.Offhand,
  ].map((s) => equipment.getEquipment(s) ?? air());
}
