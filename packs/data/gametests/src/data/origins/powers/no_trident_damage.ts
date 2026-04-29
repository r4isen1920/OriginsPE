//no_trident_damage.ts
import {
  EntityDamageCause,
  TicksPerSecond,
  system,
  world,
} from "@minecraft/server";

system.runTimeout(() => {
  world.afterEvents.entityHurt.subscribe((event) => {
    const { damage, damageSource, hurtEntity } = event;

    if (
      hurtEntity.typeId !== "minecraft:player" ||
      !hurtEntity.hasTag("power_no_trident_damage") ||
      damageSource.cause !== EntityDamageCause.projectile ||
      damageSource.damagingProjectile?.typeId !== "minecraft:thrown_trident"
    )
      return;

    hurtEntity.dimension.spawnParticle(
      "r4isen1920_originspe:bubbles",
      hurtEntity.location,
    );
    hurtEntity.dimension.playSound("ui.enchant", hurtEntity.location, {
      pitch: 1.5,
    });

    const hurtEntityHealth = hurtEntity.getComponent("health");
    if (!hurtEntityHealth) return;
    hurtEntityHealth.setCurrentValue(hurtEntityHealth.currentValue + damage);
  });
}, TicksPerSecond * 2);
