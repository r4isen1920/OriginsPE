import { world, system, TicksPerSecond } from "@minecraft/server";

/**
 * 
 * Gives the player a chance to get extra drops from fully grown crops they break,
 * but only if they have the "perk_more_crop_drops" tag
 * 
 */

const cropTypes = ["wheat", "beetroot", "carrots", "potatoes"] as const;

system.runTimeout(() => {
  world.afterEvents.playerBreakBlock.subscribe((event) => {
    const { block, brokenBlockPermutation, player } = event;
    if (!player.hasTag("perk_more_crop_drops")) return;

    const crop = cropTypes.find((cropType) =>
      brokenBlockPermutation.matches(`minecraft:${cropType}`),
    );

    const isFullyGrown = brokenBlockPermutation.getState("growth") === 7;

    if (!crop || !isFullyGrown) return;

    if (Math.random() < 0.6) return;

    player.runCommand(
      `loot spawn ${block.location.x} ${block.location.y} ${block.location.z} loot "gameplay/farming/${crop}_twice"`,
    );

    block.dimension.spawnParticle(
      "r4isen1920_originspe:experience_touch",
      block.center(),
    );
    block.dimension.playSound("random.orb", block.center(), {
      volume: 0.25,
      pitch: 2.0,
    });
    block.dimension.playSound("firework.twinkle", block.center(), {
      volume: 0.1,
      pitch: 1.25,
    });
  });
}, TicksPerSecond * 6);