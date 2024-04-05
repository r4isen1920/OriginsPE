
import { TicksPerSecond, system, world } from "@minecraft/server";

import { toAllPlayers } from "../../../origins/player";

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function nether_spawn(player) {
  if (
    !player.hasTag('power_nether_spawn') ||
    player.hasTag('nether_spawned')
  ) return

  const netherDimension = world.getDimension('minecraft:nether');

  player.addEffect('resistance', TicksPerSecond * 10, { amplifier: 255, showParticles: false });
  player.teleport(player.location, { dimension: netherDimension });

  player.addTag('_nether_spawn_check');

}

toAllPlayers(nether_spawn, TicksPerSecond * 4)

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

      const dummyEntity = player.dimension.spawnEntity('r4isen1920_originspe:safe_teleporter', player.location);
      console.warn(JSON.stringify(dummyEntity?.location))

      player.teleport(dummyEntity.location);

      player.removeEffect('resistance');

      player.removeTag('_nether_spawn_check');
      player.addTag('nether_spawned');

    }
  )

}, TicksPerSecond * 4)