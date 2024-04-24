
import { world, system, TicksPerSecond } from "@minecraft/server";

const cropTypes = [
  'wheat',
  'beetroot',
  'carrots',
  'potatoes'
]

system.runTimeout(() => {

  world.afterEvents.playerBreakBlock.subscribe(
    event => {

      const { block, brokenBlockPermutation, player } = event;
      if (!player.hasTag('perk_more_crop_drops')) return;

      const crop = cropTypes.find(crop => brokenBlockPermutation.matches(`minecraft:${crop}`));
      if (!crop || brokenBlockPermutation.getState('growth') < 7) return;

      if (Math.random() < 0.6) return;

      player.runCommand(`loot spawn ${block.location.x} ${block.location.y} ${block.location.z} loot "gameplay/farming/${crop}_twice"`)

      block.dimension.spawnParticle('r4isen1920_originspe:farmers_touch', block.center())
      world.playSound('random.orb', block.center(), { volume: 0.25, pitch: 2.0 })
      world.playSound('firework.twinkle', block.center(), { volume: 0.1, pitch: 1.25 })

    }
  )

}, TicksPerSecond * 6)
