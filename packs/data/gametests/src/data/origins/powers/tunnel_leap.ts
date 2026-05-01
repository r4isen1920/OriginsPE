//tunnel_leap.ts
import { ItemStack } from "@minecraft/server";
import { toAllPlayers } from "../../../origins/player";
import { _SCOREBOARD, ResourceBar } from "../../../origins/resource_bar";
import { Vector3 } from "../../../utils/Vec3";

import type { Player } from "@minecraft/server";

function tunnel_leap(player: Player): void {
  if (
    !player.hasTag("power_tunnel_leap") ||
    !player.hasTag("_control_use_tunnel_leap")
  )
    return;

  const stressProperty = "r4isen1920_originspe:stress";
  const currentStressValue = player.getDynamicProperty(stressProperty) || 0;
  if (!currentStressValue) player.setDynamicProperty(stressProperty, 0);

  if (
    player.hasTag("cooldown_23") &&
    (_SCOREBOARD("cd2").getScore(player) ??
      (0 <= 0 && _SCOREBOARD("cd3").getScore(player)) ??
      0 <= 0)
  ) {
    player.removeTag("cooldown_23");
  }

  if (!player.hasTag("cooldown_23")) {
    player.addTag("cooldown_23");

    const MAX_TUNNEL_DISTANCE = 8;
    const tunnelWidth = 1;
    const tunnelHeight = 1;

    const viewDir = player.getViewDirection();

    const horizontalDir = new Vector3(viewDir.x, 0, viewDir.z);

    for (let i = 0; i <= MAX_TUNNEL_DISTANCE; i++) {
      const pos = Vector3.add(
        player.location,
        new Vector3(horizontalDir.x * i, 0, horizontalDir.z * i),
      );

      for (let x = -tunnelWidth; x <= tunnelWidth; x++) {
        for (let y = -1; y <= tunnelHeight; y++) {
          for (let z = -tunnelWidth; z <= tunnelWidth; z++) {
            const blockPos = Vector3.add(pos, new Vector3(x, y, z));
            const block = player.dimension.getBlock(blockPos);

            if (block) {
              let itemToSpawn = null;

              switch (block.typeId) {
                case "minecraft:dirt":
                case "minecraft:coarse_dirt":
                case "minecraft:rooted_dirt":
                  itemToSpawn = "minecraft:dirt";
                  break;
                case "minecraft:grass_block":
                  itemToSpawn = "minecraft:grass_block";
                  break;
                case "minecraft:grass":
                  itemToSpawn = "minecraft:grass";
                  break;
                case "minecraft:dirt_with_roots":
                  itemToSpawn = "minecraft:dirt_with_roots";
                  break;
                case "minecraft:farmland":
                  itemToSpawn = "minecraft:dirt";
                  break;
                case "minecraft:mycelium":
                  itemToSpawn = "minecraft:mycelium";
                  break;
                case "minecraft:sand":
                  itemToSpawn = "minecraft:sand";
                  break;
                case "minecraft:gravel":
                  itemToSpawn = "minecraft:gravel";
                  break;
                case "minecraft:clay":
                  itemToSpawn = "minecraft:clay";
                  break;
                case "minecraft:soul_sand":
                  itemToSpawn = "minecraft:soul_sand";
                  break;
                case "minecraft:soul_soil":
                  itemToSpawn = "minecraft:soul_soil";
                  break;
                case "minecraft:snow":
                case "minecraft:snow_layer":
                  itemToSpawn = "minecraft:snow";
                  break;
                case "minecraft:red_sand":
                  itemToSpawn = "minecraft:red_sand";
                  break;
                case "minecraft:mud":
                  itemToSpawn = "minecraft:mud";
                  break;
                case "minecraft:podzol":
                  itemToSpawn = "minecraft:podzol";
                  break;
              }

              if (itemToSpawn) {
                let breakSound = "dig.grass";
                if (
                  block.typeId.includes("sand") ||
                  block.typeId.includes("gravel")
                ) {
                  breakSound = "dig.sand";
                } else if (block.typeId.includes("snow")) {
                  breakSound = "dig.snow";
                }

                player.playSound(breakSound, {
                  location: blockPos,
                  volume: 1.0,
                  pitch: 1.0,
                });

                block.setType("minecraft:air");

                const itemLocation = Vector3.add(
                  blockPos,
                  new Vector3(0.5, 0.5, 0.5),
                );
                player.dimension.spawnItem(
                  new ItemStack(itemToSpawn, 1),
                  itemLocation,
                );

                player.dimension.spawnParticle(
                  "minecraft:terrain_particle minecraft:dirt",
                  blockPos,
                );
              }
            }
          }
        }
      }
    }

    const knockbackDir = new Vector3(
      player.getViewDirection().x,
      0,
      player.getViewDirection().z,
    );
    player.applyKnockback(knockbackDir, 4);

    const COOLDOWN_DURATION = 300;
    _SCOREBOARD("cd2").setScore(player, COOLDOWN_DURATION);
    _SCOREBOARD("cd3").setScore(player, COOLDOWN_DURATION);

    player.dimension.spawnParticle(
      "minecraft:terrain_particle minecraft:dirt",
      Vector3.add(player.location, new Vector3(0, 0.5, 0)),
    );
    player.playSound("item.trident.riptide_1", { volume: 0.8, pitch: 1.0 });

    new ResourceBar(23, 0, 100, 10, false).push(player);
  } else {
    player.playSound("note.bass", { volume: 1, pitch: 1.5 });
  }

  player.removeTag("_control_use_tunnel_leap");
}

function reduceCooldown(player: Player): void {
  if (player.hasTag("cooldown_23")) {
    const cd2 = _SCOREBOARD("cd2").getScore(player) ?? 0;
    const cd3 = _SCOREBOARD("cd3").getScore(player) ?? 0;

    if (cd2 > 0) _SCOREBOARD("cd2").setScore(player, cd2 - 1);
    if (cd3 > 0) _SCOREBOARD("cd3").setScore(player, cd3 - 1);
  }
}

toAllPlayers((player) => {
  tunnel_leap(player);
  reduceCooldown(player);
}, 2);
