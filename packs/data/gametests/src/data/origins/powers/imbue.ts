import { world, system, TicksPerSecond, EntityDamageCause } from "@minecraft/server";

import { Vector3 } from "../../../utils/vec3";

import type { Player } from "@minecraft/server";
import { toAllPlayers } from "../../../origins/player";

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

      damageSource.damagingEntity.runCommand('particle r4isen1920_originspe:elven_bow_charge ^^1^1.25');
      hurtEntity.dimension.spawnParticle('r4isen1920_originspe:elven_bow_impact', Vector3.add(hurtEntity.location, new Vector3(0, 1, 0)));
      damageSource.damagingEntity.dimension.playSound('ender_eye.dead', hurtEntity.location);
      damageSource.damagingEntity.dimension.playSound('ender_eye.dead', damageSource.damagingEntity.location);

    }
  )

}, TicksPerSecond * 6)

/**
 * IMBUE
 * Enhances your projectiles to deal additional damage equivalent to 50% of your current health. This additional damage is treated as magic and will bypass armor.
 */
