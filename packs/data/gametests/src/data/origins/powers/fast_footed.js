
import { toAllPlayers } from "../../../origins/player";

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function fast_footed(player) {

  if (
    !player.hasTag('power_fast_footed') ||
    player.hasTag('_scale_set')
  ) return

  player.triggerEvent('r4isen1920_originspe:movement.0.1425');
  player.triggerEvent('r4isen1920_originspe:scale.0.75');

  player.addTag('_scale_set');

}

toAllPlayers(fast_footed, 3)
