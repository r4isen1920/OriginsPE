//quality_equipment.ts
import {
  ItemStack,
  world,
  system,
  TicksPerSecond,
  type Player,
  type Block,
  type BlockPermutation,
  type EntityInventoryComponent,
  type ItemDurabilityComponent,
} from "@minecraft/server";

import { toAllPlayers } from "../../../origins/player";
import { findItems } from "../../../utils/items";

const is_blacksmith_class_item = "r4isen1920_originspe:blacksmith_";
const is_quality_set_property = "is_quality_set";

const templateMaterials: string[] = [
  "diamond",
  "golden",
  "iron",
  "leather",
  "netherite",
  "stone",
  "wooden",
];
const templateDiggableTypes: string[] = ["axe", "hoe", "shovel", "pickaxe"];
const templateArmorTypes: string[] = [
  "boots",
  "chestplate",
  "helmet",
  "leggings",
];
const templateTypes: string[] = [
  "sword",
  ...templateDiggableTypes,
  ...templateArmorTypes,
];

const items: string[] = [
  ...templateMaterials.flatMap((material) =>
    templateTypes.map((type) => `minecraft:${material}_${type}`),
  ),
];

function quality_equipment(player: Player): void {
  const found = findItems(player);
  if (found === false) return;
  const unsetItemsInInventory = found.filter(
    (item) =>
      item?.item?.typeId !== undefined &&
      items.includes(item.item.typeId) &&
      !item.item.getDynamicProperty(is_quality_set_property),
  );

  if (unsetItemsInInventory.length === 0) return;

  for (const item of unsetItemsInInventory) {
    if (!item.item) continue;
    const baseTypeId = item.item.typeId.replace("minecraft:", "");
    const newItemTypeId = player.hasTag("class_blacksmith")
      ? `r4isen1920_originspe:blacksmith_${baseTypeId}`
      : `minecraft:${baseTypeId}`;
    const newItem = new ItemStack(newItemTypeId, item.item.amount);

    const setLore: string[] = [];
    if (
      templateArmorTypes.some(
        (type) => baseTypeId.includes(type) && baseTypeId.includes("netherite"),
      )
    )
      setLore.push("§r§7", "§r§9+1 Knockback Resistance§r");
    if (player.hasTag("class_blacksmith"))
      setLore.push("§r§6Quality Equipment§r");
    newItem.setLore(setLore);

    newItem.setDynamicProperty(is_quality_set_property, true);

    const inv = player.getComponent("inventory") as
      | EntityInventoryComponent
      | undefined;
    inv?.container?.setItem(item.slot, newItem);
  }
  if (player.hasTag("class_blacksmith"))
    player.playSound("smithing_table.use", { volume: 0.75, pitch: 1.25 });
}

toAllPlayers(quality_equipment, 15, TicksPerSecond * 15);

system.runTimeout(() => {
  world.afterEvents.playerBreakBlock.subscribe((event) => {
    const { block, brokenBlockPermutation, itemStackBeforeBreak, player } =
      event;

    if (!isValidQualityEquipment(itemStackBeforeBreak)) return;

    if (itemStackBeforeBreak?.typeId.includes(is_blacksmith_class_item)) {
      handleDurability(itemStackBeforeBreak, player);
    }

    spawnBreakParticles(block, brokenBlockPermutation);
  });
}, TicksPerSecond * 11);

function isValidQualityEquipment(
  itemStack: ItemStack | undefined,
): itemStack is ItemStack {
  return (
    !!itemStack &&
    items.some((i) => itemStack.typeId.includes(i.replace("minecraft:", ""))) &&
    templateDiggableTypes.some((i) => itemStack.typeId.includes(i)) &&
    (itemStack.getLore()?.includes("§r§6Quality Equipment§r") ?? false)
  );
}

function handleDurability(itemStack: ItemStack, player: Player): void {
  const durability = itemStack.getComponent("durability") as
    | ItemDurabilityComponent
    | undefined;
  if (!durability) return;

  const damageAmount = calculateDurabilityLoss(durability);

  updateInventory(itemStack, durability, player, damageAmount);
}

function calculateDurabilityLoss(durability: ItemDurabilityComponent): number {
  const damageChance = durability.getDamageChanceRange();

  const max = damageChance.max || 1;
  const min = damageChance.min || 1;

  let damageAmount = 0;

  if (min === max) {
    damageAmount = min;
  } else {
    const randomRoll = Math.floor(Math.random() * max) + 1;
    if (randomRoll === min) {
      damageAmount = min;
    }
  }

  return damageAmount;
}

function updateInventory(
  itemStack: ItemStack,
  durability: ItemDurabilityComponent,
  player: Player,
  damageAmount: number,
): void {
  const inv = player.getComponent("inventory") as
    | EntityInventoryComponent
    | undefined;
  const inventory = inv?.container;
  if (!inventory) return;
  let itemSlot = -1;

  for (let i = 0; i < inventory.size; i++) {
    const currentItem = inventory.getItem(i);
    if (currentItem && currentItem.typeId === itemStack.typeId) {
      const currentDurability = currentItem.getComponent("durability") as
        | ItemDurabilityComponent
        | undefined;

      if (currentDurability && currentDurability.damage === durability.damage) {
        itemSlot = i;
        break;
      }
    }
  }

  if (itemSlot === -1) return;

  durability.damage += Math.min(
    damageAmount,
    durability.maxDurability - durability.damage,
  );

  if (durability.damage >= durability.maxDurability) {
    player.playSound("random.break", { volume: 1.0, pitch: 1.0 });
    inventory.setItem(itemSlot, undefined);
  } else {
    inventory.setItem(itemSlot, itemStack);
  }
}

function spawnBreakParticles(
  block: Block,
  brokenBlockPermutation: BlockPermutation,
): void {
  const cropTypes = [
    "wheat",
    "beetroot",
    "carrots",
    "potatoes",
    "melon_stem",
    "pumpkin_stem",
    "sweet_berry_bush",
    "nether_wart",
  ];
  const isCropBlock = cropTypes.some((type) =>
    brokenBlockPermutation.matches(`minecraft:${type}`),
  );

  block.dimension.spawnParticle(
    `r4isen1920_originspe:blacksmiths_${isCropBlock ? "harvest" : "dig"}`,
    block.center(),
  );
}
