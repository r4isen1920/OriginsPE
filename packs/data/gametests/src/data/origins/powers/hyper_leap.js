import { TicksPerSecond, world } from "@minecraft/server";

import { toAllPlayers } from "../../../origins/player";
import { _SCOREBOARD, ResourceBar } from "../../../origins/resource_bar";
import { Vector3 } from "../../../utils/Vec3";

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function hyper_leap(player) {
  if (
    !player.hasTag('power_hyper_leap') ||
    !player.hasTag('_control_use_hyper_leap')
  ) return

  const stressProperty = 'r4isen1920_originspe:stress';
  const currentStressValue = player.getDynamicProperty(stressProperty) || 0;
  if (!currentStressValue) player.setDynamicProperty(stressProperty, 0);

  if (
    player.hasTag('cooldown_21') &&
    _SCOREBOARD('cd2').getScore(player) <= 0 &&
    _SCOREBOARD('cd3').getScore(player) <= 0
  ) {
    player.removeTag('cooldown_21');
  }

  if (!player.hasTag('cooldown_21')) {
    player.addTag('cooldown_21');

    player.dimension.getEntities({
      location: player.location,
      maxDistance: 6,
      excludeFamilies: [ 'inanimate' ],
      excludeTags: [ 'power_hyper_leap' ]
    }).forEach(entity => {

      entity.addEffect('levitation', TicksPerSecond * 1, { amplifier: 10, showParticles: false })

    })

    player.applyKnockback(
      player.getViewDirection().x,
      player.getViewDirection().z,
      7,
      Math.min(Math.max(player.getViewDirection().y + 0.20, 0), 1.0) * 1.75
    )

    player.dimension.spawnParticle('r4isen1920_originspe:star_leap_base', Vector3.add(player.location, new Vector3(0, 0.5, 0)));
    player.dimension.spawnParticle('r4isen1920_originspe:star_leap_stars', Vector3.add(player.location, new Vector3(0, 0.5, 0)));
    world.playSound('origins.starborne.leap', player.location);
    player.playSound('origins.starborne.leap_direct')

    // Set proper cooldown scores
    _SCOREBOARD('cd2').setScore(player, 21);
    _SCOREBOARD('cd3').setScore(player, 21);

    new ResourceBar(21, 0, 100, currentStressValue > 70 ? 1 : 3)
        .push(player)

  } else {

    player.playSound('note.bass', { volume: 1, pitch: 1.5 })

  }

  player.removeTag('_control_use_hyper_leap');

}

toAllPlayers(hyper_leap, 2)
