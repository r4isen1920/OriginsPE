
import { TicksPerSecond } from "@minecraft/server";
import { toAllPlayers } from "../../../origins/player";

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function stealth(player) {
  if (!player.hasTag('perk_stealth')) return;

  if (player.getEffect('invisibility') !== undefined) {
    player.addEffect('strength', TicksPerSecond * 3, { amplifier: 0, showParticles: false });
  }

}

toAllPlayers(stealth, 5)
