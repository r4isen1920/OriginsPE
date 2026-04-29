//sticky.ts
import { TicksPerSecond, system, world } from "@minecraft/server";

system.runTimeout(() => {
  world.afterEvents.entityHitEntity.subscribe((event) => {
    const { damagingEntity, hitEntity } = event;
    if (
      !hitEntity.hasTag("power_sticky") ||
      hitEntity.typeId !== "minecraft:player"
    )
      return;

    const fragTag = hitEntity
      .getTags()
      .find((tag) => tag.startsWith("fragmentation_level_"));
    const currentFragmentationLevel = fragTag
      ? parseInt(fragTag.replace("fragmentation_level_", ""), 10)
      : 0;
    damagingEntity.addEffect("slowness", currentFragmentationLevel * 2, {
      amplifier: currentFragmentationLevel - 1,
      showParticles: false,
    });

    damagingEntity.dimension.playSound("hit.slime", hitEntity.location);
  });
}, TicksPerSecond * 2);
