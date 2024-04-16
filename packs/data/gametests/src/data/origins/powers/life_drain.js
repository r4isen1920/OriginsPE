
import { world, system, TicksPerSecond, EntityDamageCause } from "@minecraft/server";

import { getBeelzebubProperty, incrementBeelzebubProperty } from "./beelzebub";

system.runTimeout(() => {

  world.afterEvents.entityHurt.subscribe(
    event => {

      const { damageSource, hurtEntity } = event;
      if (
        !damageSource.damagingEntity?.hasTag('power_soulreap') ||
        damageSource.cause !== EntityDamageCause.entityAttack
      ) return;

      /**
       * @type { import('@minecraft/server').Player }
       */
      const attacker = damageSource.damagingEntity;
      /**
       * @type { import('@minecraft/server').EntityHealthComponent }
       */
      const attackerHealth = attacker.getComponent('health');
      /**
       * @type { import('@minecraft/server').EntityHealthComponent }
       */
      const attackedHealth = hurtEntity.getComponent('health');
      const healthDecrementValue = Math.min(
        attackedHealth.currentValue * 0.05,
        attackerHealth.effectiveMax * 0.5
      )

      attackerHealth.setCurrentValue(Math.round(Math.max(attackerHealth.currentValue - healthDecrementValue, 2)));

    }
  )

}, TicksPerSecond * 6)
