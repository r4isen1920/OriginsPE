
import { world, system, TicksPerSecond } from "@minecraft/server";

system.runTimeout(() => {

  world.afterEvents.entityHurt.subscribe(
    event => {
      
      const { damage, damageSource, hurtEntity } = event;
      if (!damageSource.damagingEntity?.hasTag('power_poison_bonus_damage')) return;

      if (hurtEntity.getEffect('fatal_poison')?.duration > 1) {
        hurtEntity.applyDamage(Math.ceil(damage * 0.5));
        hurtEntity.dimension.spawnParticle('r4isen1920_originspe:bee_poison_sting_bonus', hurtEntity.location);
      }
    }
  )

}, TicksPerSecond * 4)
