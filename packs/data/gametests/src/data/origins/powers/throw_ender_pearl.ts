//throw_ender_pearl.ts
import { Direction, world } from "@minecraft/server";

import { toAllPlayers } from "../../../origins/player";
import { ResourceBar } from "../../../origins/resource_bar";

import type { Player } from "@minecraft/server";

const blocksPerChunk = 16;
const safeMaxRenderChunks = 12;

function throw_ender_pearl(player: Player): void {
  if (
    !player.hasTag("power_throw_ender_pearl") ||
    !player.hasTag("_control_use_throw_ender_pearl")
  )
    return;

  const playerMaxRenderChunks = player.clientSystemInfo.maxRenderDistance;

  const maxRenderDistance =
    Math.min(playerMaxRenderChunks, safeMaxRenderChunks) * blocksPerChunk;

  if (!player.hasTag("cooldown_3")) {
    const targetBlock = player.getBlockFromViewDirection({
      maxDistance: maxRenderDistance,
      includeLiquidBlocks: false,
    });

    if (!targetBlock) {
      player.removeTag("_control_use_throw_ender_pearl");
      player.playSound("note.bass", { volume: 1, pitch: 1.5 });
      return;
    }

    let targetLocation;
    const block = targetBlock.block;
    const locationMap = {
      [Direction.Down]: block?.below()?.location,
      [Direction.East]: block?.east()?.location,
      [Direction.North]: block?.north()?.location,
      [Direction.South]: block?.south()?.location,
      [Direction.Up]: block?.above()?.location,
      [Direction.West]: block?.west()?.location,
    };

    targetLocation = locationMap[targetBlock.face] || block?.location;

    player.dimension.playSound("mob.endermen.portal", player.location);
    player.dimension.playSound("mob.endermen.portal", targetLocation);

    player.teleport(targetLocation, { dimension: targetBlock.block.dimension });

    new ResourceBar(3, 0, 100, 15).push(player);
  } else {
    player.playSound("note.bass", { volume: 1, pitch: 1.5 });
  }

  player.removeTag("_control_use_throw_ender_pearl");
}

toAllPlayers(throw_ender_pearl, 2);
