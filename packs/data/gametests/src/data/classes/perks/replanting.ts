//replanting.ts
import {
  world,
  system,
  TicksPerSecond,
  Direction,
  BlockPermutation,
} from "@minecraft/server";

import { Vec3 } from "@bedrock-oss/bedrock-boost";
import { logBlocks } from "./tree_felling";

/**
 * 
 * Automatically replants saplings when the player breaks logs, 
 * but only if they have the "perk_replanting" tag
 * 
 */

const saplingBlocks: Record<string, string> = {
  acacia_log: "acacia_sapling",
  birch_log: "birch_sapling",
  cherry_log: "cherry_sapling",
  dark_oak_log: "dark_oak_sapling",
  jungle_log: "jungle_sapling",
  mangrove_log: "mangrove_propagule",
  oak_log: "oak_sapling",
  spruce_log: "spruce_sapling",
};

system.runTimeout(() => {
  world.afterEvents.playerBreakBlock.subscribe((event) => {
    const { block, brokenBlockPermutation, player } = event;
    if (!player.hasTag("perk_replanting")) return;

    const logBlock = (logBlocks as string[]).find((log: string) =>
      brokenBlockPermutation.matches(`minecraft:${log}`),
    );
    if (!logBlock) return;
    const saplingBlock = saplingBlocks[logBlock];
    if (!saplingBlock) return;

    if (Math.random() < 0.6) return;

    const viewDirection = player.getViewDirection();
    const saplingLocation = block.dimension.getBlockFromRay(
      Vec3.from(block.location).add(
        Vec3.from(viewDirection.x, 0, viewDirection.z),
      ),
      Vec3.from(0, -1, 0),
      {
        maxDistance: 16,
        includeLiquidBlocks: false,
        includePassableBlocks: false,
      },
    );
    if (!saplingLocation) return;

    const directionKey:
      | "above"
      | "below"
      | "north"
      | "south"
      | "east"
      | "west" =
      saplingLocation.face === Direction.Up
        ? "above"
        : saplingLocation.face === Direction.Down
          ? "below"
          : (saplingLocation.face.toLowerCase() as
              | "north"
              | "south"
              | "east"
              | "west");

    const newSapling = saplingLocation.block[directionKey]();
    if (!newSapling) return;

    newSapling.setPermutation(
      BlockPermutation.resolve(`minecraft:${saplingBlock}`),
    );

    block.dimension.spawnParticle(
      "r4isen1920_originspe:experience_touch",
      saplingLocation.block.center(),
    );
    block.dimension.playSound("random.orb", saplingLocation.block.center(), {
      volume: 0.25,
      pitch: 1.75,
    });
  });
}, TicksPerSecond * 6);
