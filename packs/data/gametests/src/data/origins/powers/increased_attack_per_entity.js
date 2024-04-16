
import { world, system, TicksPerSecond, EntityDamageCause } from "@minecraft/server";

system.runTimeout(() => {

  world.afterEvents.entityHurt.subscribe(
    event => {

      const { damage, damageSource, hurtEntity } = event;
      if (
        !damageSource.damagingEntity?.hasTag('power_increased_attack_per_entity') ||
        damageSource.cause !== EntityDamageCause.entityAttack
      ) return;

      const nearbyEntitiesCount = hurtEntity.dimension.getEntities({
        location: hurtEntity.location,
        maxDistance: 6,
        excludeFamilies: [ 'inanimate' ],
      })?.length || 0;

      const additionalDamageMultiplier = nearbyEntitiesCount * 0.10;
      const appliedDamage = damage * additionalDamageMultiplier;

      if (appliedDamage > 1) hurtEntity.applyDamage(Math.round(appliedDamage));
    }
  )

}, TicksPerSecond * 6)
