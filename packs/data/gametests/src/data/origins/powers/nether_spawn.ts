//nether_spawn.ts
import { TicksPerSecond, system, world } from "@minecraft/server";
import { toAllPlayers } from "../../../origins/player";

import type { Dimension, DimensionLocation, Player } from "@minecraft/server";

function createObsidianPlatform(
  dimension: Dimension,
  location: DimensionLocation,
): void {
  const platformSize = 2;

  // Create the obsidian platform
  for (let x = -platformSize; x <= platformSize; x++) {
    for (let z = -platformSize; z <= platformSize; z++) {
      const blockLoc = {
        x: Math.floor(location.x) + x,
        y: Math.floor(location.y) - 1,
        z: Math.floor(location.z) + z,
      };
      dimension.runCommand(
        `setblock ${blockLoc.x} ${blockLoc.y} ${blockLoc.z} obsidian`,
      );
    }
  }

  // Create air space around and above the player
  for (let x = -1; x <= 1; x++) {
    for (let y = 0; y <= 2; y++) {
      for (let z = -1; z <= 1; z++) {
        const airLoc = {
          x: Math.floor(location.x) + x,
          y: Math.floor(location.y) + y,
          z: Math.floor(location.z) + z,
        };
        dimension.runCommand(
          `setblock ${airLoc.x} ${airLoc.y} ${airLoc.z} air`,
        );
      }
    }
  }

  // Place chest with starter items in front of spawn position
  const chestLoc = {
    x: Math.floor(location.x),
    y: Math.floor(location.y),
    z: Math.floor(location.z) + 2, // 2 blocks in front of player
  };

  // Place and fill the chest
  dimension.runCommand(
    `setblock ${chestLoc.x} ${chestLoc.y} ${chestLoc.z} chest`,
  );
  dimension.runCommand(
    `replaceitem block ${chestLoc.x} ${chestLoc.y} ${chestLoc.z} slot.container 0 netherrack 32`,
  );
  dimension.runCommand(
    `replaceitem block ${chestLoc.x} ${chestLoc.y} ${chestLoc.z} slot.container 1 stone_pickaxe 1`,
  );
}

function nether_spawn(player: Player): void {
  if (
    !player.hasTag("power_nether_spawn") ||
    !player.hasTag("_out_of_ui") ||
    player.hasTag("_nether_spawn_check") ||
    player.hasTag("nether_spawned")
  )
    return;

  const netherDimension = world.getDimension("minecraft:nether");

  player.addEffect("resistance", TicksPerSecond * 10, {
    amplifier: 255,
    showParticles: false,
  });
  player.teleport(player.location, { dimension: netherDimension });

  player.addTag("_nether_spawn_check");
}

toAllPlayers(nether_spawn, 3);

system.runTimeout(() => {
  world.afterEvents.playerDimensionChange.subscribe((event) => {
    const { toDimension, player } = event;

    if (
      !player.hasTag("_nether_spawn_check") ||
      toDimension.id !== "minecraft:nether"
    )
      return;

    system.run(() => {
      let dummyEntity = player.dimension.getEntities({
        location: player.location,
        minDistance: 3,
        maxDistance: 64,
        closest: 1,
        excludeFamilies: ["player", "inanimate"],
      })[0];
      if (!dummyEntity)
        dummyEntity = player.dimension.spawnEntity(
          "r4isen1920_originspe:safe_teleporter",
          player.location,
        );

      // Create the obsidian platform before teleporting the player
      createObsidianPlatform(player.dimension, {
        dimension: player.dimension,
        ...dummyEntity.location,
      });

      player.teleport(dummyEntity.location);
      player.setSpawnPoint({
        dimension: player.dimension,
        x: dummyEntity.location.x,
        y: dummyEntity.location.y,
        z: dummyEntity.location.z,
      });

      player.removeEffect("resistance");

      player.removeTag("_nether_spawn_check");
      player.addTag("nether_spawned");
    });
  });
}, TicksPerSecond * 1);
