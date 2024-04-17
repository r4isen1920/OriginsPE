
import { toAllPlayers } from "../../../origins/player";

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function sneaky(player) {
  if (!player.hasTag('perk_sneaky')) return;

  player.triggerEvent('r4isen1920_originspe:display_name.false');

}

toAllPlayers(sneaky, 5)
