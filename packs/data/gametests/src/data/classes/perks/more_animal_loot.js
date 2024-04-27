
import { world, system, TicksPerSecond } from "@minecraft/server";

system.runTimeout(() => {

  world.afterEvents.entityDie.subscribe(
    event => {

      const { damageSource, deadEntity } = event
      const entity = damageSource.damagingEntity
      if (
        entity?.typeId !== 'minecraft:player' ||
        !entity?.hasTag('perk_more_animal_loot') ||
        !deadEntity.matches({ families: [ 'mob' ]}) ||
        deadEntity.getComponent('is_baby')
      ) return;

      if (Math.random() > 0.5) return

      deadEntity.runCommand('loot spawn ~~0.5~ kill @s')

      world.playSound('random.orb', deadEntity.location, { pitch: 1.75 })
      deadEntity.dimension.spawnParticle('r4isen1920_originspe:experience_touch', deadEntity.location)

    }
  )

}, TicksPerSecond * 14)
