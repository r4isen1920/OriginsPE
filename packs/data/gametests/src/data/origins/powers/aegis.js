
import { world, system, TicksPerSecond, EntityDamageCause } from "@minecraft/server";

system.runTimeout(() => {

  world.afterEvents.entityHurt.subscribe(
    event => {

      const { damage, damageSource, hurtEntity } = event;
      if (
        hurtEntity.typeId !== 'minecraft:player' ||
        !hurtEntity.hasTag('power_aegis')
      ) return

      const damagingEntity = damageSource.damagingEntity
      if (!damagingEntity) return
      if (
        damagingEntity.hasTag('power_aegis') ||
        damagingEntity.hasTag(`_under_prescience_id_${hurtEntity.id}`)
      ) return

      damagingEntity.applyDamage(Math.floor(damage * 0.5), { cause: EntityDamageCause.override, damagingEntity: hurtEntity })

    }
  )

}, TicksPerSecond * 7)
