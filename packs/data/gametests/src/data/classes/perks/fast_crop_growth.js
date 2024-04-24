
import { world, system, TicksPerSecond, BlockPermutation } from "@minecraft/server";

const cropTypes = [
  'wheat',
  'beetroot',
  'carrots',
  'potatoes',
  'melon_stem',
  'pumpkin_stem',
  {
    typeId: 'sweet_berry_bush',
    maxGrowth: 3
  },
  {
    typeId: 'nether_wart',
    maxGrowth: 3
  }
]

system.runTimeout(() => {

  world.afterEvents.playerPlaceBlock.subscribe(
    event => {

      const { block, player } = event;
      if (!player.hasTag('perk_fast_crop_growth')) return;

      const crop = cropTypes.find(crop => block.permutation.matches(`minecraft:${crop.typeId || crop}`));
      if (!crop) return;

      if (Math.random() < 0.8) return;

      block.setPermutation(
        BlockPermutation.resolve(
          `minecraft:${crop.typeId || crop}`,
          { 'growth': Math.min(1 + Math.floor((block.permutation.getState('growth') || 0) + (Math.random() * ((crop.maxGrowth || 7) - 1))), crop.maxGrowth || 7) }
        )
      )

      block.dimension.spawnParticle('r4isen1920_originspe:farmers_touch', block.center())
      world.playSound('random.orb', block.center(), { volume: 0.25, pitch: 1.75 })

    }
  )

}, TicksPerSecond * 6)
