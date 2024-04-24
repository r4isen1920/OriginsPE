
import { world, system, TicksPerSecond, EquipmentSlot, GameMode } from "@minecraft/server";

import { directions } from "./ore_vein_miner";
import { getEquipment } from "../../../utils/items";

export const logBlocks = [
  'acacia_log',
  'birch_log',
  'cherry_log',
  'crimson_stem',
  'dark_oak_log',
  'jungle_log',
  'mangrove_log',
  'oak_log',
  'spruce_log',
  'warped_stem',
]

system.runTimeout(() => {

  world.afterEvents.playerBreakBlock.subscribe(
    event => {

      const { block, brokenBlockPermutation, player } = event;
      if (
        !player.hasTag('perk_tree_felling') ||
        player.matches({ gameMode: GameMode.creative }) ||
        !getEquipment(player, EquipmentSlot.Mainhand).typeId.includes('_axe')
      ) return;

      const logBlock = logBlocks.find(log => brokenBlockPermutation.matches(`minecraft:${log}`));
      if (!logBlock) return;

      directions.forEach(direction => {
        //* Re-use the vein miner entity functionality
        const newVeinMinerEntity = player.dimension.spawnEntity('r4isen1920_originspe:vein_miner', block[direction]().center())

        newVeinMinerEntity.setDynamicProperty('r4isen1920_originspe:targetBlock', logBlock);
        newVeinMinerEntity.setDynamicProperty('r4isen1920_originspe:originator', player.id);
        newVeinMinerEntity.setDynamicProperty('r4isen1920_originspe:iteration', 0);
      })

    }
  )

}, TicksPerSecond * 6)
