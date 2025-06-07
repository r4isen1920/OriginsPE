import { Entity, EntityComponentTypes, EntityDamageCause, Player, system, TicksPerSecond, world } from "@minecraft/server";
import { ResourceBar } from "../../../origins/resource_bar";
import { incrementWrathbloomStack } from "./wrathbloom";



/** Maximum number of entities that can be chained at a time (excluding the first entity) */
const MAX_CHAIN_LINKS = 4;
/** Search radius in blocks for finding the next target of the chain */
const CHAIN_SEARCH_RADIUS = 32;
/** Delay in ticks before the chain can propagate to the next target */
const CHAIN_PROPAGATION_DELAY_TICKS = 4;
/** Duration in ticks for which the vine effect lasts */
const VINE_EFFECT_DURATION_TICKS = TicksPerSecond * 2;



system.runTimeout(() => {

   world.afterEvents.entityHitEntity.subscribe(event => {
      const { hitEntity, damagingEntity } = event;

      if (!hitEntity?.isValid() || !damagingEntity?.isValid()) {
         return;
      }

      const playerId = damagingEntity.id;
      const playerSpecificTag = `is_in_active_chain_${playerId}`;

      if (hitEntity.hasTag(playerSpecificTag)) {
         return;
      }

      if (damagingEntity.hasTag('power_vine_bind') && !damagingEntity.hasTag('cooldown_24')) {
         hitEntity.addTag(playerSpecificTag);

         const hitEntityTagTimeoutId = system.runTimeout(() => {
            if (hitEntity.isValid()) {
               hitEntity.removeTag(playerSpecificTag);
            }
         }, VINE_EFFECT_DURATION_TICKS + (MAX_CHAIN_LINKS * CHAIN_PROPAGATION_DELAY_TICKS) + TicksPerSecond); // Longest chain + vine duration + buffer

         const chainContext = {
            chainOwnerId: playerId,
            entityInfos: [{ entity: hitEntity, tagTimeoutId: hitEntityTagTimeoutId }],
            vineLinkInfos: []
         };

         propagateChain(hitEntity, chainContext, 0);
      }
   });

   world.afterEvents.entityHurt.subscribe(event => {
      const { hurtEntity, damage, damageSource } = event;

      if (!hurtEntity?.isValid() && damageSource.cause !== EntityDamageCause.magic) {
         return;
      }

      // Check if the hurt entity is part of any active chain by checking for chain tags
      const hurtEntityTags = hurtEntity.getTags();
      const chainTag = hurtEntityTags.find(tag => tag.startsWith('is_in_active_chain_'));

      if (chainTag) {
         // Find all other entities with the same chain tag
         const chainedEntities = hurtEntity.dimension.getEntities({
            tags: [chainTag]
         });

         // Apply the same damage to all other entities in the chain
         for (const entity of chainedEntities) {
            if (entity?.isValid() && entity.id !== hurtEntity.id) {
               const damageToApply = Math.floor(damage * 0.25);
               //? `applyDamage` method doesnt seem to work under these conditions
               entity.runCommand(`damage @s ${damageToApply} magic`);
               entity.dimension.spawnParticle('r4isen1920_originspe:rootkin_vine_dmg_spread', entity.location);
            }
         }
      }
   });

}, TicksPerSecond * 7);


/**
 *
 * @param { Entity } currentSourceEntity
 * @param { { chainOwnerId: string, entityInfos: Array<{ entity: Entity, tagTimeoutId: number }>, vineLinkInfos: Array<{ vineEntity: Entity }> } } chainContext
 * @param { number } linksMadeCount
 * @returns
 */
function propagateChain(currentSourceEntity, chainContext, linksMadeCount) {
   const player = world.getEntity(chainContext.chainOwnerId);
   if (!player || !player.isValid()) {
      return;
   }

   if (linksMadeCount >= MAX_CHAIN_LINKS) {
      triggerChainCollapse(chainContext);
      startCooldown(player);
      return;
   }

   system.runTimeout(() => {
      if (!currentSourceEntity.isValid()) {
         return;
      }
      const playerSpecificTag = `is_in_active_chain_${chainContext.chainOwnerId}`;

      const searchOptions = {
         location: currentSourceEntity.location,
         maxDistance: CHAIN_SEARCH_RADIUS,
         excludeTypes: [
            'minecraft:agent', 'minecraft:area_effect_cloud', 'minecraft:armor_stand', 'minecraft:arrow', 'minecraft:boat', 'minecraft:chest', 'minecraft:chest_boat', 'minecraft:chest_minecart', 'minecraft:command_block_minecart', 'minecraft:dragon_fireball', 'minecraft:minecart', 'minecraft:fireball', 'minecraft:egg', 'minecraft:ender_crystal', 'minecraft:ender_pearl', 'minecraft:eye_of_ender_signal', 'minecraft:fireworks_rocket', 'minecraft:fishing_hook', 'minecraft:hopper_minecart', 'minecraft:item', 'minecraft:lightning_bolt', 'minecraft:lingering_potion', 'minecraft:player', 'minecraft:potion', 'minecraft:llama_spit', 'minecraft:npc', 'minecraft:shulker_bullet', 'minecraft:snowball', 'minecraft:small_fireball', 'minecraft:splash_potion', 'minecraft:thrown_trident', 'minecraft:tnt', 'minecraft:tnt_minecart', 'minecraft:tripod_camera', 'minecraft:wither_skull', 'minecraft:wither_skull_dangerous', 'minecraft:xp_bottle', 'minecraft:xp_orb',
         ],
         excludeFamilies: ['vine_bind', 'projectile', 'inanimate'],
         excludeTags: [playerSpecificTag]
      };
      const potentialTargets = currentSourceEntity.dimension.getEntities(searchOptions);

      let nextTargetEntity = null;
      let minDistanceSq = Infinity;

      for (const entity of potentialTargets) {
         if (!entity.isValid() || entity.id === currentSourceEntity.id || chainContext.entityInfos.some(ei => ei.entity.id === entity.id)) {
            continue;
         }

         const sourceLocationRaw = currentSourceEntity.getHeadLocation();
         const sourceLocation = {
            x: sourceLocationRaw.x,
            y: sourceLocationRaw.y + 1,
            z: sourceLocationRaw.z
         }
         const targetLocation = entity.location;

         const direction = {
            x: targetLocation.x - sourceLocation.x,
            y: targetLocation.y - sourceLocation.y,
            z: targetLocation.z - sourceLocation.z
         };
         const distance = Math.sqrt(direction.x ** 2 + direction.y ** 2 + direction.z ** 2);

         if (distance > 0) {
            const hitBlock = currentSourceEntity.dimension.getBlockFromRay(sourceLocation, direction, {
               maxDistance: distance,
               includeLiquidBlocks: true,
               includePassableBlocks: false,
            });
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
               "minecraft:large_fern",
               "minecraft:light_block"
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
         nextTargetEntity.addTag(playerSpecificTag);
         
         const nextTargetTagTimeoutId = system.runTimeout(() => {
            if (nextTargetEntity.isValid()) {
               nextTargetEntity.removeTag(playerSpecificTag);
            }
         }, VINE_EFFECT_DURATION_TICKS + CHAIN_PROPAGATION_DELAY_TICKS);
         chainContext.entityInfos.push({ entity: nextTargetEntity, tagTimeoutId: nextTargetTagTimeoutId });

         const vineSpawnData = spawnVine(currentSourceEntity, nextTargetEntity, linksMadeCount === 0);
         if (vineSpawnData.vineEntity) {
            chainContext.vineLinkInfos.push({
               vineEntity: vineSpawnData.vineEntity
            });
         }

         propagateChain(nextTargetEntity, chainContext, linksMadeCount + 1);
      } else {
         // No next target found, chain ends naturally
         startCooldown(player);
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

   world.playSound('totem_shield.break', locationFrom, { pitch: 0.5 });

   if (!vineEntity) {
      return {};
   }

   vineEntity.setProperty('r4isen1920_originspe:length', Math.max(distance - 1, 0));

   // Dispell the invisibility effect of the target entities if they have it
   if (from.getEffect('minecraft:invisibility') || to.getEffect('minecraft:invisibility')) {
      from.removeEffect('minecraft:invisibility');
      to.removeEffect('minecraft:invisibility');
   }

   const particleCount = Math.max(1, distance);
   if (particleCount > 0) {
      const particleStep = 1 / particleCount;
      for (let i = 0; i <= 1; i += particleStep) {
         const particlePos = {
            x: locationFrom.x + direction.x * i,
            y: locationFrom.y + direction.y * i,
            z: locationFrom.z + direction.z * i
         };
         from.dimension.spawnParticle('r4isen1920_originspe:rootkin_vine_spawn', particlePos);
         system.runTimeout(() => {
            if (!from.isValid()) return;
            from.dimension.spawnParticle('r4isen1920_originspe:rootkin_vine_despawn', particlePos);
         }, VINE_EFFECT_DURATION_TICKS)
      }
   }

   const tick = system.runInterval(() => {
      if (isInitialSourceInChain && from.isValid()) {
         from.teleport({
            x: locationFrom.x,
            y: from.isOnGround ? Math.floor(locationFrom.y) : locationFrom.y,
            z: locationFrom.z,
         });
      }
      if (to.isValid()) {
         to.teleport(adjustedLocationTo);
      }
   })

   system.runTimeout(() => {
      if (vineEntity.isValid()) {
         vineEntity.triggerEvent('r4isen1920_originspe:instant_despawn');
         world.playSound('totem_shield.break', locationFrom, { pitch: 1.5 });
      }

      system.clearRun(tick);
   }, VINE_EFFECT_DURATION_TICKS);

   return { vineEntity };
}

function triggerChainCollapse(chainContext) {
   system.runTimeout(() => {
      let totalHealth = 0;
      const entitiesToDamage = [];

      for (const entityInfo of chainContext.entityInfos) {
         const entity = entityInfo.entity;
         if (entity?.isValid()) {
            const healthComponent = entity.getComponent(EntityComponentTypes.Health);
            if (healthComponent) {
               totalHealth += healthComponent.currentValue;
            }
            entitiesToDamage.push(entity);
         }
      }

      const damageToApply = totalHealth * 0.12;

      for (const entity of entitiesToDamage) {
         if (entity.isValid()) {
            try {
               const entityDimension = entity.dimension;
               entityDimension.spawnParticle('r4isen1920_originspe:rootkin_vine_break', entity.location);
            } catch {}
            entity.applyDamage(damageToApply, {
               cause: EntityDamageCause.magic,
            });

            world.playSound('totem_shield.deactivate', entity.location);
         }
      }

      incrementWrathbloomStack(world.getEntity(chainContext.chainOwnerId));
      
   }, MAX_CHAIN_LINKS * CHAIN_PROPAGATION_DELAY_TICKS);
}

/**
 * @param { Player } player 
 */
function startCooldown(player) {
   system.runTimeout(() => {
      new ResourceBar(24, 0, 100, 13, false)
          .push(player);
   }, TicksPerSecond * 2.5);
}
