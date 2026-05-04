//no_sprint_exhaustion.ts
import { Player } from '@minecraft/server';
import { toAllPlayers } from '../../../origins/player';

/** 
 * 
 * Prevents the player from getting sprint exhaustion when they 
 * have the "perk_no_sprint_exhaustion" tag
 * 
 */

function no_sprint_exhaustion(player: Player): void {
  if (!player.hasTag('perk_no_sprint_exhaustion')) return;

  player.triggerEvent('r4isen1920_originspe:exhaustion.explorer');

}

toAllPlayers(no_sprint_exhaustion, 10);
