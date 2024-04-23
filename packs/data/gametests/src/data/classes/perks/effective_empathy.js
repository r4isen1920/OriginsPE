
import { world, system, TicksPerSecond } from "@minecraft/server";

const potionEffects = [
  'fire_resistance',
  'invisibility',
  'jump_boost',
  'night_vision',
  'poison',
  'regeneration',
  'resistance',
  'slow_falling',
  'slowness',
  'speed',
  'strength',
  'water_breathing',
  'weakness'
]

system.runTimeout(() => {

  world.afterEvents.effectAdd.subscribe(
    event => {

      const { entity } = event;
      if (
        entity.typeId !== 'minecraft:player' ||
        !entity.hasTag('perk_effective_empathy')
      ) return;

      const validEffects = entity.getEffects().map(e => ({ typeId: e.typeId, duration: e.duration, amplifier: e.amplifier })).filter(e => (potionEffects.includes(e.typeId) && e.amplifier < 10));
      if (validEffects.length === 0) return;

      entity.dimension.getEntities({
        location: entity.location,
        maxDistance: 21,
        tags: [ 'perk_tamed_animal_boost' ],
        excludeFamilies: [ 'player', 'inanimate' ]
      }).forEach(nearbyEntity => {
        validEffects.forEach(effect => {
          nearbyEntity.addEffect(effect.typeId, effect.duration, { amplifier: effect.amplifier || 0 });
        })
      })

    }
  )

}, TicksPerSecond * 6)
