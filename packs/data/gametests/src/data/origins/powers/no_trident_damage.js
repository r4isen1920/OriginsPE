
import { EntityDamageCause, TicksPerSecond, system, world } from "@minecraft/server";

system.runTimeout(() => {

  world.afterEvents.entityHurt.subscribe(
    event => {
  
      const { damage, damageSource, hurtEntity } = event;

      if (
        hurtEntity.typeId !== 'minecraft:player' ||
        !hurtEntity.hasTag('power_no_trident_damage') ||
        damageSource.cause !== EntityDamageCause.projectile ||
        damageSource.damagingProjectile?.typeId !== 'minecraft:thrown_trident'
      ) return;
  
      hurtEntity.dimension.spawnParticle('r4isen1920_originspe:bubbles', hurtEntity.location)
      world.playSound('ui.enchant', hurtEntity.location, { pitch: 1.5 })
  
      /**
       * @type { import('@minecraft/server').EntityHealthComponent }
       */
      const hurtEntityHealth = hurtEntity.getComponent('health');
      hurtEntityHealth.setCurrentValue(hurtEntityHealth.currentValue + damage)
  
    }
  )

}, TicksPerSecond * 2)
