
import { world, system, TicksPerSecond, EntityDamageCause } from "@minecraft/server";

import { ResourceBar } from "../../../origins/resource_bar";
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
      if (
        getBeelzebubProperty(attacker) < 3 ||
        attacker.hasTag('cooldown_20')
      ) return;

      hurtEntity.applyDamage(getBeelzebubProperty(attacker, 'dmg'), { cause: EntityDamageCause.entityAttack, damagingEntity: attacker });
      incrementBeelzebubProperty(attacker, 'phase', -3);
      incrementBeelzebubProperty(attacker, 'dmg', -1 * getBeelzebubProperty(attacker, 'dmg'));

      new ResourceBar(20, 0, 100, 1)
          .pop(attacker, 19)
          .push(attacker)

    }
  )

}, TicksPerSecond * 6)
