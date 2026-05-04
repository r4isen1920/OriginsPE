import { world, system, TicksPerSecond, EntityDamageCause, Player } from "@minecraft/server";

import { Vec3 } from "@bedrock-oss/bedrock-boost";

system.runTimeout(() => {

  world.afterEvents.entityHurt.subscribe(
    event => {

      const { damageSource, hurtEntity } = event;
      if (
        !damageSource.damagingEntity?.hasTag('power_imbue') ||
        damageSource.cause !== EntityDamageCause.projectile ||
        damageSource.damagingProjectile?.typeId !== 'minecraft:arrow'
      ) return;

      /**
       * @type { import('@minecraft/server').EntityHealthComponent }
       */
      // const damagerHealthComponent = damageSource.damagingEntity.getComponent('health');
      const damagerHealthComponent: any = damageSource.damagingEntity.getComponent('health');
      // Nerfed: Remove undead bonus, only scale with current health
      let additionalDamage = damagerHealthComponent.currentValue * 0.5;

      hurtEntity.applyDamage(Math.round(additionalDamage), { cause: EntityDamageCause.override, damagingEntity: damageSource.damagingEntity });

      const viewDirection = damageSource.damagingEntity.getViewDirection();
      const chargeParticleLocation = {
        x: damageSource.damagingEntity.location.x + (viewDirection.x * 1.25),
        y: damageSource.damagingEntity.location.y + 1 + (viewDirection.y * 1.25),
        z: damageSource.damagingEntity.location.z + (viewDirection.z * 1.25),
      };
      damageSource.damagingEntity.dimension.spawnParticle('r4isen1920_originspe:elven_bow_charge', chargeParticleLocation);
      hurtEntity.dimension.spawnParticle('r4isen1920_originspe:elven_bow_impact', Vec3.from(hurtEntity.location).add(Vec3.from(0, 1, 0)));
      damageSource.damagingEntity.dimension.playSound('ender_eye.dead', hurtEntity.location);
      damageSource.damagingEntity.dimension.playSound('ender_eye.dead', damageSource.damagingEntity.location);

    }
  );

}, TicksPerSecond * 6);

/**
 * IMBUE
 * Enhances your projectiles to deal additional damage equivalent to 50% of your current health. This additional damage is treated as magic and will bypass armor.
 */
