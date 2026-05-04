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

import { getCachedPlayers } from "../../../origins/player";
import { findItems } from "../../../utils/items";

const is_blacksmith_class_item = "r4isen1920_originspe:blacksmith_";
const is_quality_set_property = "is_quality_set";

const templateMaterials = [
  "diamond",
  "golden",
  "iron",
  "leather",
  "netherite",
  "stone",
  "wooden",
];
const templateDiggableTypes = ["axe", "hoe", "shovel", "pickaxe"];
const templateArmorTypes = ["boots", "chestplate", "helmet", "leggings"];
const templateTypes = [
  "sword",
  ...templateDiggableTypes,
  ...templateArmorTypes,
];

const itemsSet = new Set(
  templateMaterials.flatMap((material) =>
    templateTypes.map((type) => `minecraft:${material}_${type}`),
  ),
);

const inventoryStateCache = new Map<string, string>();

function processPlayerInventory(player: Player): void {
  if (!player.isValid) return;

  const inv = player.getComponent("inventory") as
    | EntityInventoryComponent
    | undefined;
  const container = inv?.container;
  if (!container) return;

  let currentHash = "";
  const size = container.size;
  for (let i = 0; i < size; i++) {
    const item = container.getItem(i);
    currentHash += item ? `${item.typeId}${item.amount},` : "e,";
  }

  if (inventoryStateCache.get(player.id) === currentHash) return;
  inventoryStateCache.set(player.id, currentHash);

  const found = findItems(player);
  if (!found) return;

  for (const slotData of found) {
    const item = slotData?.item;
    if (!item || item.getDynamicProperty(is_quality_set_property) === true)
      continue;

    const typeId = item.typeId;
    if (itemsSet.has(typeId)) {
      const baseTypeId = typeId.replace("minecraft:", "");
      const isBlacksmith = player.hasTag("class_blacksmith");
      const newItemTypeId = isBlacksmith
        ? `${is_blacksmith_class_item}${baseTypeId}`
        : typeId;

      const newItem = new ItemStack(newItemTypeId, item.amount);
      const setLore: string[] = [];

      if (
        templateArmorTypes.some(
          (type) =>
            baseTypeId.includes(type) && baseTypeId.includes("netherite"),
        )
      ) {
        setLore.push("§r§7", "§r§9+1 Knockback Resistance§r");
      }

      if (isBlacksmith) {
        setLore.push("§r§6Quality Equipment§r");
      }

      newItem.setLore(setLore);
      newItem.setDynamicProperty(is_quality_set_property, true);
      container.setItem(slotData.slot, newItem);

      if (isBlacksmith) {
        player.playSound("smithing_table.use", { volume: 0.75, pitch: 1.25 });
      }
    }
  }
}

let playerIndex = 0;
system.runInterval(() => {
  const players = getCachedPlayers();
  if (players.length === 0) return;

  if (playerIndex >= players.length) playerIndex = 0;

  processPlayerInventory(players[playerIndex]);
  playerIndex++;
}, 2);

world.afterEvents.playerLeave.subscribe((ev) =>
  inventoryStateCache.delete(ev.playerId),
);

system.runTimeout(() => {
  world.afterEvents.playerBreakBlock.subscribe((event) => {
    const { block, brokenBlockPermutation, itemStackBeforeBreak, player } =
      event;
    if (!isValidQualityEquipment(itemStackBeforeBreak)) return;

    if (itemStackBeforeBreak.typeId.includes(is_blacksmith_class_item)) {
      handleDurability(itemStackBeforeBreak, player);
    }
    spawnBreakParticles(block, brokenBlockPermutation);
  });
}, TicksPerSecond * 11);

function isValidQualityEquipment(
  itemStack: ItemStack | undefined,
): itemStack is ItemStack {
  if (!itemStack) return false;
  const tid = itemStack.typeId;
  const normalizedId = tid.replace(is_blacksmith_class_item, "minecraft:");
  if (!itemsSet.has(normalizedId)) return false;
  const lore = itemStack.getLore();
  return lore ? lore.includes("§r§6Quality Equipment§r") : false;
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
  const { min = 1, max = 1 } = durability.getDamageChanceRange();
  if (min === max) return min;
  return Math.floor(Math.random() * max) + 1 === min ? min : 0;
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

  for (let i = 0; i < inventory.size; i++) {
    const currentItem = inventory.getItem(i);
    if (currentItem?.typeId === itemStack.typeId) {
      const currentDurability = currentItem.getComponent("durability") as
        | ItemDurabilityComponent
        | undefined;
      if (currentDurability?.damage === durability.damage) {
        durability.damage += Math.min(
          damageAmount,
          durability.maxDurability - durability.damage,
        );
        if (durability.damage >= durability.maxDurability) {
          player.playSound("random.break", { volume: 1.0, pitch: 1.0 });
          inventory.setItem(i, undefined);
        } else {
          inventory.setItem(i, itemStack);
        }
        break;
      }
    }
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
