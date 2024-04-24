
import { toAllPlayers } from "../../../origins/player";

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function divine_aura(player) {
  if (!player.hasTag('power_divine_aura')) return

  player.triggerEvent('r4isen1920_originspe:has_divine_aura.true');

}

toAllPlayers(divine_aura, 10)
