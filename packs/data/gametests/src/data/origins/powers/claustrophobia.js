
import { toAllPlayers } from "../../../origins/player";
import { Vector3 } from "../../../utils/Vec3";

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function claustrophobia(player) {

  if (!player.hasTag('power_claustrophobia')) return

  const block = player.dimension.getBlockFromRay(player.getHeadLocation(), new Vector3(0, 1, 0), { maxDistance: 4 })?.block

  if (block === undefined) {
    player.setDynamicProperty(
      'r4isen1920_originspe:claustrophobia',
      Math.max((player.getDynamicProperty('r4isen1920_originspe:claustrophobia') || 0) - 1, 0)
    )
  } else {
    player.setDynamicProperty(
      'r4isen1920_originspe:claustrophobia',
      Math.min((player.getDynamicProperty('r4isen1920_originspe:claustrophobia') || 0) + 1, 200)
    )
  }

  if (player.getDynamicProperty('r4isen1920_originspe:claustrophobia') < 150) {
    player.triggerEvent('r4isen1920_originspe:attack.1');
    player.triggerEvent('r4isen1920_originspe:movement.0.1');
  } else {
    player.triggerEvent('r4isen1920_originspe:attack.0');
    player.triggerEvent('r4isen1920_originspe:movement.0.05');
  }

}

toAllPlayers(claustrophobia, 2)
