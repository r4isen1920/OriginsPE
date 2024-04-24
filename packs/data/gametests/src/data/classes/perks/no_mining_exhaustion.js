
import { toAllPlayers } from '../../../origins/player';

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 * @returns 
 */
function no_mining_exhaustion(player) {
  if (!player.hasTag('perk_no_mining_exhaustion')) return;

  player.triggerEvent('r4isen1920_originspe:exhaustion.miner');

}

toAllPlayers(no_mining_exhaustion, 10);
