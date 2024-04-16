
import { world, system, TicksPerSecond, EntityDamageCause } from "@minecraft/server";

import { ResourceBar } from "../../../origins/resource_bar";
import { getBeelzebubProperty, incrementBeelzebubProperty } from "./beelzebub";
import { Vector3 } from "../../../utils/Vec3";

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
        getBeelzebubProperty(attacker) < 4 ||
        attacker.hasTag('cooldown_20')
      ) return;

      hurtEntity.applyDamage(getBeelzebubProperty(attacker, 'dmg'), { cause: EntityDamageCause.entityAttack, damagingEntity: attacker });
      incrementBeelzebubProperty(attacker, 'phase', -4);
      incrementBeelzebubProperty(attacker, 'dmg', -1 * getBeelzebubProperty(attacker, 'dmg'));

      world.playSound('ender_eye.dead', hurtEntity.location);
      hurtEntity.dimension.spawnParticle('r4isen1920_originspe:voidwalker_soulreap', Vector3.add(hurtEntity.location, new Vector3(0, 0.5, 0)))

      new ResourceBar(20, 0, 100, 1)
          .pop(attacker, 19)
          .push(attacker)

    }
  )

}, TicksPerSecond * 6)
