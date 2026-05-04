//stealth.ts
import { TicksPerSecond, Player } from "@minecraft/server";
import { toAllPlayers } from "../../../origins/player";

/**
 * 
 * Grants the player strength when they are invisible and have the 
 * "perk_stealth" tag, simulating a stealthy combat boost
 * 
 */

function stealth(player: Player): void {
  if (!player.hasTag("perk_stealth")) return;

  if (player.getEffect("invisibility") !== undefined) {
    player.addEffect("strength", TicksPerSecond * 3, {
      amplifier: 0,
      showParticles: false,
    });
  }
}

toAllPlayers(stealth, 5);
