//twin_breeding.ts
import { world, system, TicksPerSecond } from "@minecraft/server";

/**
 * 
 * Gives animals a chance to produce twins when they breed if the player
 * has the "perk_twin_breeding" tag and is nearby, simulating a genetic trait
 * that increases the likelihood of multiple births in the player's animals
 * 
 */

system.runTimeout(() => {
  world.afterEvents.dataDrivenEntityTrigger.subscribe((event) => {
    const { entity, eventId } = event;
    if (eventId !== "minecraft:entity_born") return;

    try {
      if (entity.hasTag("_perk_twin_breeding")) return;

      const hasRancherNearby =
        entity.dimension.getEntities({
          location: entity.location,
          maxDistance: 12,
          type: "minecraft:player",
          tags: ["perk_twin_breeding"],
        }).length > 0;

      if (!hasRancherNearby || Math.random() < 0.5) return;

      const additionalBirth = entity.dimension.spawnEntity(
        `${entity.typeId}<minecraft:entity_born>`,
        entity.location,
      );
      additionalBirth.addTag("_perk_twin_breeding");

      entity.dimension.playSound("random.orb", entity.location, {
        pitch: 1.75,
      });
      entity.dimension.spawnParticle(
        "r4isen1920_originspe:experience_touch",
        entity.location,
      );
    } catch {
      // Ignore runtime errors from unsupported entity operations.
    }
  });
}, TicksPerSecond * 16);
