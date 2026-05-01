//wandering_trader_spawn.ts
import { TicksPerSecond, Player } from "@minecraft/server";

import { toAllPlayers } from "../../../origins/player";
import { Vector3 } from "../../../utils/Vec3";

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
    Vector3.add(
      player.location,
      new Vector3(Math.random() * 32 - 16, 1, Math.random() * 32 - 16),
    ),
  );
}

toAllPlayers(wandering_trader_spawn, 12000, TicksPerSecond * 10);
