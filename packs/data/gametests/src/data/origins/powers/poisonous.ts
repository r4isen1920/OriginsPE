//poisonous.ts
import { world, system, TicksPerSecond, Player } from "@minecraft/server";
import { changeStingerLevel } from "./sacrifice_stinger.js";

system.runTimeout(() => {
  world.afterEvents.entityHurt.subscribe((event) => {
    const { damageSource, hurtEntity } = event;
    if (hurtEntity.getEffect("fatal_poison")?.duration ?? 1) return;

    if (
      damageSource.damagingEntity?.hasTag("power_poisonous") &&
      !damageSource.damagingEntity?.isOnGround
    ) {
      hurtEntity.addEffect("fatal_poison", TicksPerSecond * 7, {
        amplifier: 0,
      });

      const currentStingerLevel = parseInt(
        damageSource.damagingEntity
          .getTags()
          .filter((tag) => tag.includes("stinger_level_"))[0]
          .replace("stinger_level_", ""),
      );
      if (damageSource.damagingEntity?.typeId === "minecraft:player") {
        changeStingerLevel(
          damageSource.damagingEntity as Player,
          currentStingerLevel - 1,
        );
      }

      hurtEntity.dimension.spawnParticle(
        "r4isen1920_originspe:bee_poison_sting",
        hurtEntity.location,
      );
      hurtEntity.dimension.playSound("enchant.thorns.hit", hurtEntity.location);
    }
  });
}, TicksPerSecond * 4);
