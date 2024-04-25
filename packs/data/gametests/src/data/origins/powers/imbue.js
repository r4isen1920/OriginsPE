
import { world, system, TicksPerSecond, EntityDamageCause } from "@minecraft/server";

import { Vector3 } from "../../../utils/Vec3";

system.runTimeout(() => {

  world.afterEvents.entityHurt.subscribe(
    event => {

      const { damageSource, hurtEntity } = event;
      if (
        !damageSource.damagingEntity?.hasTag('power_imbue') ||
        damageSource.cause !== EntityDamageCause.projectile
      ) return;

      /**
       * @type { import('@minecraft/server').EntityHealthComponent }
       */
      const damagerHealthComponent = damageSource.damagingEntity.getComponent('health');
      const isTargetUndead = hurtEntity.matches({ families: [ 'undead' ]});

      let additionalDamage = damagerHealthComponent.currentValue * 0.5;
      if (isTargetUndead) additionalDamage += ((hurtEntity.getComponent('health')?.effectiveMax || 0) * 0.25);

      hurtEntity.applyDamage(Math.round(additionalDamage), { cause: EntityDamageCause.override, damagingEntity: damageSource.damagingEntity });

      hurtEntity.dimension.spawnParticle('r4isen1920_originspe:elven_bow_charge', Vector3.add(hurtEntity.location, new Vector3(0, 1, 0)));
      hurtEntity.dimension.spawnParticle('r4isen1920_originspe:elven_bow_impact', Vector3.add(hurtEntity.location, new Vector3(0, 1, 0)));
      world.playSound('ender_eye.dead', hurtEntity.location);
      damageSource.damagingEntity.playSound('ender_eye.dead');
    }
  )

}, TicksPerSecond * 6)
