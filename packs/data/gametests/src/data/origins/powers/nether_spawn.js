
import { TicksPerSecond, system, world } from "@minecraft/server";

import { toAllPlayers } from "../../../origins/player";

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function nether_spawn(player) {
  if (
    !player.hasTag('power_nether_spawn') ||
    !player.hasTag('_out_of_ui') ||
    player.hasTag('_nether_spawn_check') ||
    player.hasTag('nether_spawned')
  ) return

  const netherDimension = world.getDimension('minecraft:nether');

  player.addEffect('resistance', TicksPerSecond * 10, { amplifier: 255, showParticles: false });
  player.teleport(player.location, { dimension: netherDimension });

  player.addTag('_nether_spawn_check');

}

toAllPlayers(nether_spawn, 3)

/**
 * 
 * Check if the player has changed
 * dimensions
 */
system.runTimeout(() => {

  world.afterEvents.playerDimensionChange.subscribe(
    event => {

      const { toDimension, player } = event;

      if (
        !player.hasTag('_nether_spawn_check') ||
        toDimension.id !== 'minecraft:nether'
      ) return

      system.run(() => {

        let dummyEntity = player.dimension.getEntities({ location: player.location, minDistance: 3, maxDistance: 64, closest: 1, excludeFamilies: [ 'player', 'inanimate' ] })[0];
        if (!dummyEntity) dummyEntity = player.dimension.spawnEntity('r4isen1920_originspe:safe_teleporter', player.location);

        player.teleport(dummyEntity.location);
        player.setSpawnPoint({ dimension: player.dimension, x: dummyEntity.location.x, y: dummyEntity.location.y, z: dummyEntity.location.z });
  
        player.removeEffect('resistance');
  
        player.removeTag('_nether_spawn_check');
        player.addTag('nether_spawned');

      })

    }
  )

}, TicksPerSecond * 1)
