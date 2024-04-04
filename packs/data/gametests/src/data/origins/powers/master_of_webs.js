
import { toAllPlayers } from "../../../origins/player";
import { Vector3 } from "../../../utils/Vec3";
import { removeTags } from "../../../utils/tags";

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function master_of_webs(player) {

  /**
   * @param { number } yPos 
   * @returns { import('@minecraft/server').Block }
   */
  const block = function(yPos) {
    return player.dimension.getBlock(Vector3.add(player.location, new Vector3(0, yPos, 0)))
  }

  if (!player.hasTag('power_master_of_webs')) return;

  if (block(0).permutation.matches('web') || block(1).permutation.matches('web')) {

    if (block(0).permutation.matches('web') && block(1).permutation.matches('web')) {
      player.addTag('_master_of_webs_1')
      player.removeTag('_master_of_webs_0')
    } else {
      player.addTag('_master_of_webs_0')
      player.removeTag('_master_of_webs_1')
    }

  } else {
    removeTags(player, '_master_of_webs')
  }

}

toAllPlayers(master_of_webs, 1)
