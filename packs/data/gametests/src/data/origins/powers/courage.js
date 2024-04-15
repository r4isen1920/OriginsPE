
import { world } from "@minecraft/server";

import { toAllPlayers } from "../../../origins/player";
import { Vector3 } from "../../../utils/Vec3";

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function courage(player) {
  if (!player.hasTag('power_courage')) return;

  if (
    player.getEffect('weakness') ||
    player.getEffect('wither')
  ) {

    player.removeEffect('weakness');
    player.removeEffect('wither');

  }


}

toAllPlayers(courage, 3)
