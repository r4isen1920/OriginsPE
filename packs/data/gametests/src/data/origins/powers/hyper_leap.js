
import { TicksPerSecond, world } from "@minecraft/server";

import { toAllPlayers } from "../../../origins/player";
import { _SCOREBOARD, ResourceBar } from "../../../origins/resource_bar";

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

  if (player.hasTag('cooldown_11')) {
    player.removeTag('_control_use_hyper_leap');
    return
  }

  if (
    player.hasTag('cooldown_21') &&
    (_SCOREBOARD('cd2').getScore(player) === 0 || _SCOREBOARD('cd2').getScore(player) !== 21) &&
    (_SCOREBOARD('cd3').getScore(player) === 0 || _SCOREBOARD('cd3').getScore(player) !== 21)
  ) player.removeTag('cooldown_21');

  if (!player.hasTag('cooldown_21')) {

    player.addTag('cooldown_21');

    player.addEffect('levitation', TicksPerSecond * 1, { amplifier: 5, showParticles: false })

    player.applyKnockback(
      player.getViewDirection().x,
      player.getViewDirection().z,
      10,
      Math.min(Math.max(player.getViewDirection().y + 0.20, 0), 1.0) * 1.75
    )

    world.playSound('origins.starborne.leap', player.location);
    player.playSound('origins.starborne.leap_direct')

    new ResourceBar(21, 0, 100, currentStressValue > 70 ? 1 : 3)
        .push(player)

  } else {

    player.playSound('note.bass', { volume: 1, pitch: 1.5 })

  }

  player.removeTag('_control_use_hyper_leap');

}

toAllPlayers(hyper_leap, 2)
