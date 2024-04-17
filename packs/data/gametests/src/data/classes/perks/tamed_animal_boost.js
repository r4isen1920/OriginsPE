
import { TicksPerSecond } from "@minecraft/server";

import { toAllPlayers } from "../../../origins/player";

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function tamed_animal_boost(player) {
  if (!player.hasTag('perk_tamed_animal_boost')) return;

  const nearbyEntities = player.dimension.getEntities({
    location: player.location,
    maxDistance: 21,
    excludeFamilies: [ 'player', 'inanimate' ]
  })

  nearbyEntities.forEach(entity => {
    if (entity.getComponent('is_tamed')) entity.addTag('_already_tamed');
    else if (player.hasTag('perk_tamed_animal_boost')) {
      const entityMaxHealth = entity.getComponent('health').effectiveMax;
      entity.addEffect('health_boost', TicksPerSecond * 9999, { amplifier: 1 + Math.floor(entityMaxHealth / 4), showParticles: false });
    }
  })

}

toAllPlayers(tamed_animal_boost, 10)
