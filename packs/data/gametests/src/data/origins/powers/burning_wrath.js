
import { LocationOutOfWorldBoundariesError, TicksPerSecond, world } from "@minecraft/server";

import { toAllPlayers } from "../../../origins/player";
import { ResourceBar } from "../../../origins/resource_bar";
import { Vector3 } from "../../../utils/Vec3";

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function burning_wrath(player) {
  if (
    !player.hasTag('power_burning_wrath') ||
    !player.hasTag('_control_use_burning_wrath')
  ) return


  if (!player.hasTag('cooldown_4')) {



    new ResourceBar(4, 0, 100, 30)
        .push(player)

  } else {

    player.playSound('note.bass', { volume: 1, pitch: 1.5 })

  }

  player.removeTag('_control_use_burning_wrath');

}

toAllPlayers(burning_wrath, 2)
