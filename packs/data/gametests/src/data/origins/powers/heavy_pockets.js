import { world, system, TicksPerSecond } from "@minecraft/server";

const GOLD_ITEMS = [
  "minecraft:gold_ingot",
  "minecraft:gold_block",
  "minecraft:golden_apple",
  "minecraft:golden_carrot",
  "minecraft:golden_sword",
  "minecraft:golden_pickaxe",
  "minecraft:golden_axe",
  "minecraft:golden_shovel",
  "minecraft:golden_hoe",
  "minecraft:golden_helmet",
  "minecraft:golden_chestplate",
  "minecraft:golden_leggings",
  "minecraft:golden_boots",
];

const STACK_SIZE = 64;
const THRESHOLDS = [
  { stacks: 18, tag: "_heavy_pockets_slow3", event: "r4isen1920_originspe:movement.0.05" }, // 97.5% slow
  { stacks: 12, tag: "_heavy_pockets_slow2", event: "r4isen1920_originspe:movement.0.075" },  // 95% slow
];
const NUGGET_THRESHOLD = 12; // 12 nuggets = slow
const NUGGET_TAG = "_heavy_pockets_nugget_slow";
const NUGGET_EVENT = "r4isen1920_originspe:movement.0.075"; // Same as 6 stacks penalty
const NORMAL_EVENT = "r4isen1920_originspe:movement.0.1"; // Normal speed

system.runInterval(() => {
  for (const player of world.getPlayers()) {
    let goldCount = 0;
    let nuggetCount = 0;
    const inventory = player.getComponent("inventory");
    if (!inventory) continue;

    for (let i = 0; i < inventory.container.size; i++) {
      const item = inventory.container.getItem(i);
      if (!item) continue;
      if (item.typeId === "minecraft:gold_nugget") {
        nuggetCount += item.amount;
      } else if (GOLD_ITEMS.includes(item.typeId)) {
        goldCount += item.amount;
      }
    }

    // Remove all slow tags before applying new one
    for (const t of THRESHOLDS) {
      if (player.hasTag(t.tag)) player.removeTag(t.tag);
    }
    if (player.hasTag(NUGGET_TAG)) player.removeTag(NUGGET_TAG);

    let applied = false;
    for (const t of THRESHOLDS) {
      if (goldCount >= t.stacks * STACK_SIZE) {
        player.runCommand(`event entity @s ${t.event}`);
        player.addTag(t.tag);
        applied = true;
        break;
      }
    }
    // If no block/ingot threshold met, check for nugget threshold
    if (!applied && nuggetCount >= NUGGET_THRESHOLD) {
      player.runCommand(`event entity @s ${NUGGET_EVENT}`);
      player.addTag(NUGGET_TAG);
      applied = true;
    }
    if (!applied) {
      player.runCommand(`event entity @s ${NORMAL_EVENT}`);
    }
  }
}, TicksPerSecond * 2);

/**
 * HEAVY POCKETS (Pigling)
 * Carrying too many gold items will slow your movement speed in stages:
 * - 6 stacks (384 items): movement speed 0.075
 * - 12 stacks (768 items): movement speed 0.05
 * - 18 stacks (1152+ items): movement speed 0.025
 * - Carrying 12 or more gold nuggets (even without other gold): movement speed 0.075
 * Below these: normal speed (0.1)
 * The highest penalty always applies.
 */