
import { EntityDamageCause, TicksPerSecond, system, world } from "@minecraft/server";

system.runTimeout(() => {

  world.afterEvents.entityHurt.subscribe(
    event => {
  
      const { damage, damageSource, hurtEntity } = event;

      if (
        hurtEntity.typeId !== 'minecraft:player' ||
        !hurtEntity.hasTag('power_fire_immunity')
      ) return;

      if (
        damageSource.cause === EntityDamageCause.fire ||
        damageSource.cause === EntityDamageCause.lava ||
        damageSource.cause === EntityDamageCause.fireTick ||
        damageSource.cause === EntityDamageCause.magma
      ) {
        /**
         * @type { import('@minecraft/server').EntityHealthComponent }
         */
        const hurtEntityHealth = hurtEntity.getComponent('health');
        hurtEntityHealth.setCurrentValue(hurtEntityHealth.currentValue + damage);

        hurtEntity.addEffect('strength', TicksPerSecond * 12, { amplifier: 1 });
        hurtEntity.dimension.spawnParticle('r4isen1920_originspe:blaze_aura', hurtEntity.location);
      }

    }
  )

}, TicksPerSecond * 2)
