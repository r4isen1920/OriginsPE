
import { TicksPerSecond } from "@minecraft/server";

import { toAllPlayers } from "../../../origins/player";
import { MathR4 } from "../../../utils/Math";

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

  for (let i = 0; i < nearbyEntities.length; i++) {
    const entity = nearbyEntities[i];

    if (
      entity.hasTag('perk_tamed_animal_boost') &&
      !entity.hasTag('_already_tamed')
    ) {
      const healthBoostAmplifier = Math.floor(entity.getComponent('health').defaultValue / 4)
      entity.addEffect('health_boost', TicksPerSecond * 9999, { amplifier: MathR4.clamp(healthBoostAmplifier, 0, 255), showParticles: false });

      if (!entity.hasTag('_on_tamed')) {
        entity.addEffect('regeneration', TicksPerSecond * 10, { amplifier: 255, showParticles: false });
        entity.addTag('_on_tamed');
      }
    }
  }

}

toAllPlayers(tamed_animal_boost, 10)
