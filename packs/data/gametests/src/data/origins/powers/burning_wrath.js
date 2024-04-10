
import { TicksPerSecond, system, world } from "@minecraft/server";
import { ResourceBar } from "../../../origins/resource_bar";

system.runTimeout(() => {

  world.afterEvents.entityHitEntity.subscribe(
    event => {

      const { damagingEntity, hitEntity } = event;

      if (
        !damagingEntity.hasTag('power_burning_wrath') ||
        !damagingEntity.getComponent('onfire') ||
        damagingEntity.hasTag('cooldown_4')
      ) return

      const fireDuration = (hitEntity.getComponent('health').currentValue / 2) + (((damagingEntity.getEffect('strength')?.amplifier + 1) || 0) * 2);
      const targets = damagingEntity.dimension.getEntities({
        location: hitEntity.location,
        maxDistance: 4,
        excludeFamilies: [ 'inanimate' ],
        excludeTags: [ 'power_burning_wrath' ]
      })

      targets.forEach(entity => {
        entity.setOnFire(fireDuration, false)
      })
      hitEntity.dimension.spawnParticle('r4isen1920_originspe:blaze_impact', hitEntity.location)
      world.playSound('mob.ghast.fireball', hitEntity.location, { pitch: 1.25 })

      new ResourceBar(4, 0, 100, 3)
          .push(damagingEntity)

    }
  )

}, TicksPerSecond * 2)
