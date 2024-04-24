
import { toAllPlayers } from '../../../origins/player';

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 * @returns 
 */
function no_sprint_exhaustion(player) {
  if (!player.hasTag('perk_no_sprint_exhaustion')) return;

  player.triggerEvent('r4isen1920_originspe:exhaustion.explorer');

}

toAllPlayers(no_sprint_exhaustion, 10);
