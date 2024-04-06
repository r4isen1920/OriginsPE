
import { LocationOutOfWorldBoundariesError, TicksPerSecond, world } from "@minecraft/server";

import { toAllPlayers } from "../../../origins/player";
import { ResourceBar } from "../../../origins/resource_bar";
import { Vector3 } from "../../../utils/Vec3";

const MAX_DISTANCE = 16;

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function phantomize(player) {
  if (!player.hasTag('power_phantomize')) return;

  if (player.hasTag('_control_use_phantomize')) {

    switch (true) {

      case player.hasTag('cooldown_23'):
        player.playSound('note.bass', { volume: 1, pitch: 1.5 });
        player.removeTag('_control_use_phantomize');
        return;

      case !player.hasTag('_phantomized'):
        enterPhantomizedForm(player);
        break;

      case player.hasTag('_phantomized'):
        exitPhantomizedForm(player);
        break;

      default:
        break;
    }
    return;
  }

  if (player.hasTag('_phantomized')) {

    const startLocation = player.getDynamicProperty('r4isen1920_originspe:phantomized_start');
    const distanceTravelled = Math.floor((Vector3.distance(startLocation, player.location) / MAX_DISTANCE) * 100);

    const isPlayerMoving = player.getVelocity().x !== 0 || player.getVelocity().y !== 0 || player.getVelocity().z !== 0;

    if (isPlayerMoving) {

      player.setDynamicProperty('r4isen1920_originspe:move_ticks', 0)

      new ResourceBar(21, distanceTravelled, distanceTravelled, 1, true)
          .pop(player, 5)
          .update(player)

      player.removeTag('_phantomized_stopped_moving');

    } else {

      player.setDynamicProperty(
        'r4isen1920_originspe:move_ticks',
        Math.min((player.getDynamicProperty('r4isen1920_originspe:move_ticks') || 0) + 1, 10)
      )
      const move_ticks = player.getDynamicProperty('r4isen1920_originspe:move_ticks') || 0;

      if (!player.hasTag('_phantomized_stopped_moving')) {
        new ResourceBar(5, 100, 0, 1, false)
            .push(player)
        player.addTag('_phantomized_stopped_moving');
      }

      if (move_ticks >= 10) {
        exitPhantomizedForm(player);
      }
    }

    if (distanceTravelled >= 100) {

      player.addEffect('slowness', TicksPerSecond * 5, { amplifier: 5 });
      player.addEffect('blindness', TicksPerSecond * 5, { amplifier: 5 });
      player.addEffect('weakness', TicksPerSecond * 5, { amplifier: 5 });

      player.playSound('respawn_anchor.deplete', { pitch: 1.25 });

      exitPhantomizedForm(player);
    }

  }

}

toAllPlayers(phantomize, 2)

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function enterPhantomizedForm(player) {

  player.onScreenDisplay.setActionBar('origins.brown_vignette');
  player.runCommand('gamemode spectator');

  world.playSound('mob.endermen.portal', player.location, { pitch: 0.75 });

  new ResourceBar(21, 0, 0, 1, true)
      .push(player)

  player.addTag('_phantomized');
  player.removeTag('_control_use_phantomize');
  player.setDynamicProperty('r4isen1920_originspe:phantomized_start', player.location);

}

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 * @param { boolean } forced 
 */
function exitPhantomizedForm(player, forced=false) {

  player.onScreenDisplay.setActionBar('origins.clear');
  player.runCommand('gamemode survival');

  world.playSound('mob.endermen.portal', player.location, { pitch: 0.75 });

  new ResourceBar(5, 100, 0, 1)
      .clear(player)

  const startLocation = player.getDynamicProperty('r4isen1920_originspe:phantomized_start');
  const distanceTravelled = Math.floor((Vector3.distance(startLocation, player.location) / MAX_DISTANCE) * 100);

  new ResourceBar(21, 100, 0, forced ? 100 : Math.round(distanceTravelled / 2), false)
      .push(player, false)
  new ResourceBar(23, 0, 100, forced ? 100 : Math.round(distanceTravelled / 2), false)
      .push(player)

  player.removeTag('_phantomized');
  player.removeTag('_control_use_phantomize');
  player.setDynamicProperty('r4isen1920_originspe:move_ticks', 0)

}
