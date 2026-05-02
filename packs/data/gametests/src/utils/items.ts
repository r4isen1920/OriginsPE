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

function snapshotInventory(entity: Entity): InventoryItem[] | false {
  const inventory = entity.getComponent("inventory") as
    | EntityInventoryComponent
    | undefined;
  if (!inventory) return false;

  const container = inventory.container as Container;
  const size = container.size;
  const snapshot: InventoryItem[] = [];

  for (let i = 0; i < size; i++) {
    snapshot.push({ item: container.getItem(i), slot: i });
  }

  return snapshot;
}

export function findItems(
  entity: Entity,
  item: string = "all",
): InventoryItem[] | false {
  const snapshot = snapshotInventory(entity);
  if (!snapshot) return false;

  if (item === "all") return snapshot;

  const results = snapshot.filter((x) => x.item?.typeId.includes(item));
  return results.length > 0 ? results : false;
}

export function findItem(entity: Entity, item: string): InventoryItem | false {
  const snapshot = snapshotInventory(entity);
  if (!snapshot) return false;

  return snapshot.find((x) => x.item?.typeId.includes(item)) ?? false;
}

export function findItemsWithLore(
  entity: Entity,
  item: string,
  lore: string[],
): InventoryItem[] | false {
  const items = findItems(entity, item);
  if (!items) return false;

  const results = items.filter((x) =>
    x.item?.getLore().some((y) => lore.some((z) => y.includes(z))),
  );

  return results.length > 0 ? results : false;
}

export function searchItemId(entity: Entity, itemKey: string): boolean {
  const snapshot = snapshotInventory(entity);
  if (!snapshot) return false;

  return snapshot.some((x) => x.item?.typeId.includes(itemKey));
}

export function getItemsCountInInventory(player: Player): CountedItem[] {
  const snapshot = snapshotInventory(player);
  if (!snapshot) return [];

  const results: CountedItem[] = [];
  for (const { item } of snapshot) {
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
