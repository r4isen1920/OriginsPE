import { world, system, TicksPerSecond, BlockPermutation } from "@minecraft/server";

const cropTypes = [
  "wheat",
  "beetroot",
  "carrots",
  "potatoes",
  "melon_stem",
  "pumpkin_stem",
  {
    typeId: "sweet_berry_bush",
    maxGrowth: 3,
  },
  {
    typeId: "nether_wart",
    maxGrowth: 3,
  },
] as const;

system.runTimeout(() => {
  world.afterEvents.playerPlaceBlock.subscribe((event) => {
    const { block, player } = event;
    if (!player.hasTag("perk_fast_crop_growth")) return;

    const crop = cropTypes.find((crop) =>
      block.permutation.matches(`minecraft:${typeof crop === "string" ? crop : crop.typeId}`),
    );
    if (!crop) return;

    if (Math.random() < 0.8) return;

    const cropId = typeof crop === "string" ? crop : crop.typeId;
    const maxGrowth = typeof crop === "string" ? 7 : crop.maxGrowth;
    const currentGrowth = Number(block.permutation.getState("growth") ?? 0);

    block.setPermutation(
      BlockPermutation.resolve(cropId, {
        growth: Math.min(
          1 + Math.floor(currentGrowth + Math.random() * (maxGrowth - 1)),
          maxGrowth,
        ),
      }),
    );

    block.dimension.spawnParticle(
      "r4isen1920_originspe:experience_touch",
      block.center(),
    );
    world.playSound("random.orb", block.center(), { volume: 0.25, pitch: 1.75 });
  });
}, TicksPerSecond * 6);