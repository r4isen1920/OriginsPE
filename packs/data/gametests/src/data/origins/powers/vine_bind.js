import { Entity, system, TicksPerSecond, world } from "@minecraft/server";

/** Maximum number of entities that can be chained at a time (excluding the first entity) */
const MAX_CHAIN_LINKS = 6;
/** Search radius in blocks for finding the next target of the chain */
const CHAIN_SEARCH_RADIUS = 32;
/** Delay in ticks before the chain can propagate to the next target */
const CHAIN_PROPAGATION_DELAY_TICKS = 2;
/** Duration in ticks for which the vine effect lasts */
const VINE_EFFECT_DURATION_TICKS = TicksPerSecond * 2;

system.runTimeout(() => {

   world.afterEvents.entityHitEntity.subscribe(event => {
      const { hitEntity, damagingEntity } = event;

      if (!hitEntity?.isValid() || !damagingEntity?.isValid()) {
         return;
      }

      if (hitEntity.hasTag('is_in_active_chain')) {
         return;
      }

      if (damagingEntity.hasTag('power_vine_bind')) {
         const linkedEntitiesInChainSet = new Set();

         hitEntity.addTag('is_in_active_chain');
         linkedEntitiesInChainSet.add(hitEntity.id);

         system.runTimeout(() => {
            if (hitEntity.isValid()) {
               hitEntity.removeTag('is_in_active_chain');
            }
         }, VINE_EFFECT_DURATION_TICKS + (MAX_CHAIN_LINKS * CHAIN_PROPAGATION_DELAY_TICKS) + TicksPerSecond); // Longest chain + vine duration + buffer

         propagateChain(hitEntity, linkedEntitiesInChainSet, 0);
      }
   });

}, TicksPerSecond * 7);


function propagateChain(currentSourceEntity, linkedEntitiesInChainSet, linksMadeCount) {
   if (linksMadeCount >= MAX_CHAIN_LINKS) {
      return;
   }

   system.runTimeout(() => {
      if (!currentSourceEntity.isValid()) {
         return;
      }

      const searchOptions = {
         location: currentSourceEntity.location,
         maxDistance: CHAIN_SEARCH_RADIUS,
         excludeTypes: [
            'minecraft:agent', 'minecraft:area_effect_cloud', 'minecraft:armor_stand', 'minecraft:arrow', 'minecraft:boat', 'minecraft:chest', 'minecraft:chest_boat', 'minecraft:chest_minecart', 'minecraft:command_block_minecart', 'minecraft:dragon_fireball', 'minecraft:minecart', 'minecraft:fireball', 'minecraft:egg', 'minecraft:ender_crystal', 'minecraft:ender_pearl', 'minecraft:eye_of_ender_signal', 'minecraft:fireworks_rocket', 'minecraft:fishing_hook', 'minecraft:hopper_minecart', 'minecraft:item', 'minecraft:lightning_bolt', 'minecraft:lingering_potion', 'minecraft:player', 'minecraft:potion', 'minecraft:llama_spit', 'minecraft:npc', 'minecraft:shulker_bullet', 'minecraft:snowball', 'minecraft:small_fireball', 'minecraft:splash_potion', 'minecraft:thrown_trident', 'minecraft:tnt', 'minecraft:tnt_minecart', 'minecraft:tripod_camera', 'minecraft:wither_skull', 'minecraft:wither_skull_dangerous', 'minecraft:xp_bottle', 'minecraft:xp_orb',
         ],
         excludeFamilies: ['vine_bind', 'projectile', 'inanimate'],
         excludeTags: ['is_in_active_chain']
      };
      const potentialTargets = currentSourceEntity.dimension.getEntities(searchOptions);

      let nextTargetEntity = null;
      let minDistanceSq = Infinity;

      for (const entity of potentialTargets) {
         if (!entity.isValid() || entity.id === currentSourceEntity.id || linkedEntitiesInChainSet.has(entity.id)) {
            continue;
         }

         const sourceLocation = currentSourceEntity.getHeadLocation();
         const targetLocation = entity.location;

         const direction = {
            x: targetLocation.x - sourceLocation.x,
            y: targetLocation.y - sourceLocation.y,
            z: targetLocation.z - sourceLocation.z
         };
         const distance = Math.sqrt(direction.x ** 2 + direction.y ** 2 + direction.z ** 2);

         if (distance > 0) {
            const hitBlock = currentSourceEntity.dimension.getBlockFromRay(sourceLocation, direction, { maxDistance: distance });
            const ignoredBlockTypes = [
               // TODO: expand this list
               "minecraft:bush",
               "minecraft:deadbush",
               "minecraft:firefly_bush",
               "minecraft:sweet_berry_bush",
               "minecraft:short_grass",
               "minecraft:tall_grass",
               "minecraft:short_dry_grass",
               "minecraft:tall_dry_grass",
               "minecraft:seagrass",
               "minecraft:fern",
               "minecraft:large_fern"
            ];
            if (hitBlock && !ignoredBlockTypes.includes(hitBlock.typeId)) {
               continue;
            }
         }

         const loc1 = currentSourceEntity.location;
         const loc2 = entity.location;
         const distanceSq = (loc1.x - loc2.x)**2 + (loc1.y - loc2.y)**2 + (loc1.z - loc2.z)**2;

         if (distanceSq < minDistanceSq) {
            minDistanceSq = distanceSq;
            nextTargetEntity = entity;
         }
      }

      if (nextTargetEntity && nextTargetEntity.isValid()) {
         nextTargetEntity.addTag('is_in_active_chain');
         linkedEntitiesInChainSet.add(nextTargetEntity.id);

         system.runTimeout(() => {
            if (nextTargetEntity.isValid()) {
               nextTargetEntity.removeTag('is_in_active_chain');
            }
         }, VINE_EFFECT_DURATION_TICKS + CHAIN_PROPAGATION_DELAY_TICKS);

         spawnVine(currentSourceEntity, nextTargetEntity, linksMadeCount === 0);

         propagateChain(nextTargetEntity, linkedEntitiesInChainSet, linksMadeCount + 1);
      }
   }, CHAIN_PROPAGATION_DELAY_TICKS);
}


/**
 * Spawns a vine between two entities. This will create a link between the two entities.
 * @param { Entity } from The entity where the vine would start
 * @param { Entity } to The entity where the vine would end
 * @param { boolean } isInitialSourceInChain Whether the 'from' entity is the first entity hit in the entire chain.
 */
function spawnVine(from, to, isInitialSourceInChain) {
   const rawlocationFrom = from.location;
   const rawlocationTo = to.location;
   const yHeadLocationFrom = from.getHeadLocation().y;
   const yHeadLocationTo = to.getHeadLocation().y;
   const yDifferenceFrom = (Math.abs(yHeadLocationFrom - rawlocationFrom.y) / 2);
   const yDifferenceTo = (Math.abs(yHeadLocationTo - rawlocationTo.y) / 2);
   const locationFrom = {
      x: rawlocationFrom.x,
      y: rawlocationFrom.y + yDifferenceFrom,
      z: rawlocationFrom.z
   }
   const locationTo = {
      x: rawlocationTo.x,
      y: rawlocationTo.y + yDifferenceTo,
      z: rawlocationTo.z
   }

   const direction = {
      x: locationTo.x - locationFrom.x,
      y: locationTo.y - locationFrom.y,
      z: locationTo.z - locationFrom.z
   };
   const distance = Math.floor(Math.sqrt(direction.x ** 2 + direction.y ** 2 + direction.z ** 2));

   const magnitude = Math.sqrt(direction.x ** 2 + direction.y ** 2 + direction.z ** 2);

   let adjustedLocationTo = { ...locationTo };

   if (magnitude > 0) {
      const unitVector = {
         x: direction.x / magnitude,
         y: direction.y / magnitude,
         z: direction.z / magnitude
      };

      adjustedLocationTo = {
         x: locationFrom.x + unitVector.x * distance,
         y: locationFrom.y + unitVector.y * distance - yDifferenceTo,
         z: locationFrom.z + unitVector.z * distance
      };
   }


   //? Summon command supports initial rotation upon spawning
   from.runCommand(`summon r4isen1920_originspe:vine_bind ${locationFrom.x} ${locationFrom.y} ${locationFrom.z} facing ${locationTo.x} ${locationTo.y} ${locationTo.z}`);
   const vineEntity = from.dimension.getEntities({
      type: 'r4isen1920_originspe:vine_bind',
      location: locationFrom,
      maxDistance: 1
   })[0];

   if (!vineEntity) {
      return;
   }

   vineEntity.setProperty('r4isen1920_originspe:length', Math.max(distance - 1, 0));

   const tick = system.runInterval(() => {
      if (isInitialSourceInChain && from.isValid()) {
         from.teleport(locationFrom);
      }
      if (to.isValid()) {
         to.teleport(adjustedLocationTo);
      }
   })

   system.runTimeout(() => {
      vineEntity.triggerEvent('r4isen1920_originspe:instant_despawn');

      system.clearRun(tick);
   }, VINE_EFFECT_DURATION_TICKS);
}
