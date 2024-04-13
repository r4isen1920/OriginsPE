
import { toAllPlayers } from "../../../origins/player";

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function bite_sized(player) {

  if (!player.hasTag('power_bite_sized')) return

  player.triggerEvent('r4isen1920_originspe:scale.0.25');
  player.triggerEvent('r4isen1920_originspe:health.10');
  player.triggerEvent('r4isen1920_originspe:family_type.bite_sized');

}

toAllPlayers(bite_sized, 5)
