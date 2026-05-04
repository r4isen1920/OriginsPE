import { world, system, TicksPerSecond } from "@minecraft/server";

/**
 * 
 * Gives nearby tamed animals the same potion effects as the player,
 * but only if the player has certain potion effects and the nearby
 * animals have the "perk_tamed_animal_boost" tag
 * 
 */

const potionEffects = [
  "fire_resistance",
  "invisibility",
  "jump_boost",
  "night_vision",
  "poison",
  "regeneration",
  "resistance",
  "slow_falling",
  "slowness",
  "speed",
  "strength",
  "water_breathing",
  "weakness",
];

system.runTimeout(() => {
  world.afterEvents.effectAdd.subscribe((event) => {
    const { entity } = event;
    if (entity.typeId !== "minecraft:player" || !entity.hasTag("perk_effective_empathy")) return;

    const validEffects = entity
      .getEffects()
      .map((effect) => ({ typeId: effect.typeId, duration: effect.duration, amplifier: effect.amplifier }))
      .filter((effect) => potionEffects.includes(effect.typeId) && effect.amplifier < 10);
    if (validEffects.length === 0) return;

    entity.dimension
      .getEntities({
        location: entity.location,
        maxDistance: 21,
        tags: ["perk_tamed_animal_boost"],
        excludeFamilies: ["player", "inanimate"],
      })
      .forEach((nearbyEntity) => {
        validEffects.forEach((effect) => {
          nearbyEntity.addEffect(effect.typeId, effect.duration, {
            amplifier: effect.amplifier || 0,
          });
        });
      });
  });
}, TicksPerSecond * 6);