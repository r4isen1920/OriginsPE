import { EntityDamageCause, world } from "@minecraft/server";

world.beforeEvents.entityHurt.subscribe((event) => {
  const { damageSource, hurtEntity } = event;

  if (
    hurtEntity.typeId !== "minecraft:player" ||
    !hurtEntity.hasTag("power_fall_immunity") ||
    damageSource.cause !== EntityDamageCause.fall
  ) {
    return;
  }

  event.cancel = true;
});
