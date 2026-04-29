//wrathbloom.ts
import { system, TicksPerSecond, world } from "@minecraft/server";

import type { Player } from "@minecraft/server";

import { toAllPlayers } from "../../../origins/player";
import { _SCOREBOARD, ResourceBar } from "../../../origins/resource_bar";
import { removeTags } from "../../../utils/tags";

const BAR_LEVELS: number[] = [0, 15, 29, 43, 57, 71, 85, 100];

function wrathbloom(player: Player): void {
  if (!player.hasTag("power_wrathbloom")) return;

  const wrathbloomTags = player
    .getTags()
    .filter(
      (tag) => tag.includes("wrathbloom_stacks_") && !tag.includes("_was"),
    );
  if (wrathbloomTags.length > 1) removeTags(player, "wrathbloom_stacks_");

  if (wrathbloomTags.length > 1 || wrathbloomTags.length === 0) {
    changeWrathbloomStack(player, 0);
  }

  const currentLevelTag = wrathbloomTags[0] || "wrathbloom_stacks_7";
  const currentLevel = parseInt(currentLevelTag.split("_").pop() as string);

  if (player.hasTag(`_was_wrathbloom_stacks_${currentLevel + 1}`)) {
    onDecrementWrathbloomStack(player, currentLevel);
  } else if (
    player.hasTag(`_was_wrathbloom_stacks_${currentLevel - 1}`) ||
    (currentLevel === 7 && player.hasTag("_was_wrathbloom_stacks_0"))
  ) {
    onIncrementWrathbloomStack(player, currentLevel);
  } else {
    initializeResourceBar(player, currentLevel);
  }

  if (player.hasTag("_barehanded")) {
    player.triggerEvent(
      "r4isen1920_originspe:attack." + Math.max(1, currentLevel),
    );
  } else {
    player.triggerEvent("r4isen1920_originspe:attack.0");
  }
}

function initializeResourceBar(player: Player, level: number): void {
  if (
    !player.hasTag("_init_bar") &&
    _SCOREBOARD("gui").getScore(player) === 1
  ) {
    new ResourceBar(25, BAR_LEVELS[level], BAR_LEVELS[level], 1, true).push(
      player,
    );
    player.addTag("_init_bar");
  }
}

toAllPlayers(wrathbloom, 3);

export function changeWrathbloomStack(
  player: Player,
  level: string | number,
): void {
  const levelClamped = Math.min(Math.max(Number(level), 0), 7);
  const removedTags = removeTags(player, "wrathbloom_stacks");
  player.addTag(`wrathbloom_stacks_${levelClamped}`);
  if (removedTags.length > 0) player.addTag(`_was_${removedTags[0]}`);
}

export function incrementWrathbloomStack(player: Player): void {
  const wrathbloomTags = player
    .getTags()
    .filter((tag) => tag.includes("wrathbloom_stacks_"));
  const currentLevel =
    wrathbloomTags.length > 0
      ? parseInt(wrathbloomTags[0].replace("wrathbloom_stacks_", ""))
      : 0;
  changeWrathbloomStack(player, currentLevel + 1);
}

export function decrementWrathbloomStack(player: Player): void {
  const wrathbloomTags = player
    .getTags()
    .filter((tag) => tag.includes("wrathbloom_stacks_"));
  const currentLevel =
    wrathbloomTags.length > 0
      ? parseInt(wrathbloomTags[0].replace("wrathbloom_stacks_", ""))
      : 0;
  changeWrathbloomStack(player, currentLevel - 1);
}

function onIncrementWrathbloomStack(
  player: Player,
  level: string | number,
): void {
  removeTags(player, "_was_wrathbloom_stacks");

  new ResourceBar(
    25,
    BAR_LEVELS[Number(level) - 1],
    BAR_LEVELS[Number(level)],
    1,
    true,
  ).push(player);
}

function onDecrementWrathbloomStack(
  player: Player,
  level: string | number,
): void {
  removeTags(player, "_was_wrathbloom_stacks");

  new ResourceBar(
    25,
    BAR_LEVELS[Number(level) + 1],
    BAR_LEVELS[Number(level)],
    1,
    true,
  ).push(player);
}

system.runTimeout(() => {
  world.afterEvents.entityDie.subscribe((event) => {
    const { deadEntity, damageSource } = event;

    if (
      deadEntity.typeId === "minecraft:player" &&
      deadEntity.hasTag("power_wrathbloom")
    ) {
      changeWrathbloomStack(deadEntity as Player, 0);
      (deadEntity as Player).removeTag("_init_bar");
    } else if (
      damageSource.damagingEntity?.typeId === "minecraft:player" &&
      damageSource.damagingEntity.hasTag("power_wrathbloom") &&
      !damageSource.damagingEntity.hasTag("cooldown_24")
    ) {
      decrementWrathbloomStack(damageSource.damagingEntity as Player);
    }
  });
}, TicksPerSecond * 7);
