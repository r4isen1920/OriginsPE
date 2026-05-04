//wandering_trader_spawn.ts
import { TicksPerSecond, Player } from "@minecraft/server";

import { toAllPlayers } from "../../../origins/player";
import { Vec3 } from "@bedrock-oss/bedrock-boost";

/**
 * 
 * Spawns a wandering trader near the player when they have the
 * "perk_wandering_trader_spawn" tag, but only if there isn't already
 * a wandering trader nearby, simulating a magical connection that attracts
 * wandering traders to the player
 * 
 */

function wandering_trader_spawn(player: Player): void {
  if (!player.hasTag("perk_wandering_trader_spawn")) return;

  if (Math.random() < 0.5) return;

  const isWanderingTraderNearby = player.dimension.getEntities({
    location: player.location,
    maxDistance: 48,
    type: "minecraft:wandering_trader",
  });
  if (isWanderingTraderNearby.length > 0) return;

  player.dimension.spawnEntity(
    "minecraft:wandering_trader",
    Vec3.from(player.location).add(
      Vec3.from(Math.random() * 32 - 16, 1, Math.random() * 32 - 16),
    ),
  );
}

toAllPlayers(wandering_trader_spawn, TicksPerSecond * 10);
