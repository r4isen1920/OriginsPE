
import { world, system, TicksPerSecond, Direction, BlockPermutation } from "@minecraft/server";

import { Vector3 } from "../../../utils/Vec3";
import { logBlocks } from "./tree_felling";

const saplingBlocks = {
  'acacia_log': 'acacia_sapling',
  'birch_log': 'birch_sapling',
  'cherry_log': 'cherry_sapling',
  'dark_oak_log': 'dark_oak_sapling',
  'jungle_log': 'jungle_sapling',
  'mangrove_log': 'mangrove_propagule',
  'oak_log': 'oak_sapling',
  'spruce_log': 'spruce_sapling',
}

system.runTimeout(() => {

  world.afterEvents.playerBreakBlock.subscribe(
    event => {

      const { block, brokenBlockPermutation, player } = event;
      if (!player.hasTag('perk_replanting')) return;

      const logBlock = logBlocks.find(log => brokenBlockPermutation.matches(`minecraft:${log}`));
      const saplingBlock = saplingBlocks[logBlock];
      if (!logBlock || !saplingBlock) return;

      if (Math.random() < 0.6) return;

      const saplingLocation = block.dimension.getBlockFromRay(
        Vector3.add(block.location, new Vector3(player.getViewDirection().x, 0, player.getViewDirection().z)),
        new Vector3(0, -1, 0),
        {
          maxDistance: 16,
          includeLiquidBlocks: false,
          includePassableBlocks: false
        }
      )
      if (!saplingLocation) return;

      const newSapling = saplingLocation.block[saplingLocation.face === Direction.Up ? 'above' : (saplingLocation.face === Direction.Down ? 'below' : saplingLocation.face)]()

      newSapling.setPermutation(
        BlockPermutation.resolve(`minecraft:${saplingBlock}`)
      );

      block.dimension.spawnParticle('r4isen1920_originspe:experience_touch', saplingLocation.block.center())
      world.playSound('random.orb', saplingLocation.block.center(), { volume: 0.25, pitch: 1.75 })

    }
  )

}, TicksPerSecond * 6)
