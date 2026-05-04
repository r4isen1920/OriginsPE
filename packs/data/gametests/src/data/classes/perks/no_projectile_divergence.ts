//no_projectile_divergence.ts
import type { Player } from "@minecraft/server";

/** 
 * 
 * Prevents projectile divergence when the player has the 
 * "perk_no_projectile_divergence" tag
 * 
 */

function no_projectile_divergence(_player: Player): boolean {
  return true;
}

export { no_projectile_divergence };
