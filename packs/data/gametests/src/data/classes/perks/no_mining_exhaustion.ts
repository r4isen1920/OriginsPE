//no_mining_exhaustion.ts
import type { Player } from "@minecraft/server";

import { toAllPlayers } from "../../../origins/player";

/** 
 * 
 * Prevents the player from getting mining exhaustion when they 
 * have the "perk_no_mining_exhaustion" tag
 * 
 */

function no_mining_exhaustion(player: Player): void {
  if (!player.hasTag("perk_no_mining_exhaustion")) return;

  player.triggerEvent("r4isen1920_originspe:exhaustion.miner");
}

toAllPlayers(no_mining_exhaustion, 10);
