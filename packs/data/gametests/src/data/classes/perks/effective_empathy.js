
import { world, system, TicksPerSecond } from "@minecraft/server";

const potionEffects = [
  'minecraft:fire_resistance',
  'minecraft:invisibility',
  'minecraft:jump_boost',
  'minecraft:night_vision',
  'minecraft:poison',
  'minecraft:regeneration',
  'minecraft:resistance',
  'minecraft:slow_falling',
  'minecraft:slowness',
  'minecraft:speed',
  'minecraft:strength',
  'minecraft:water_breathing',
  'minecraft:weakness'
]

system.runTimeout(() => {

  world.afterEvents.effectAdd.subscribe(
    event => {

      const { entity } = event;
      if (
        entity.typeId !== 'minecraft:player' ||
        !entity.hasTag('perk_effective_empathy') ||
        !entity.hasTag('_out_of_ui')
      ) return;

      const validEffects = entity.getEffects().map(e => ({ typeId: e.typeId, duration: e.duration, amplifier: e.amplifier })).filter(e => potionEffects.includes(e.typeId));
      console.warn(`${entity.name}: ${JSON.stringify(validEffects)}`)

      entity.dimension.getEntities({
        location: entity.location,
        maxDistance: 21,
        tags: [ 'perk_tamed_animal_boost' ],
        excludeFamilies: [ 'player', 'inanimate' ]
      }).forEach(nearbyEntity => {
        validEffects.forEach(effect => {
          nearbyEntity.addEffect(effect.typeId, effect.duration, { amplifier: effect.amplifier });
        })
      })

    }
  )

}, TicksPerSecond * 6)
