import { TicksPerSecond, type Player } from "@minecraft/server";

import { toAllPlayers } from "../../../origins/player";


/** 
 * 
 * Makes trades cheaper by giving the player the village hero effect
 * which makes villagers give better trades
 * 
 */

function cheaper_trades(player: Player) {
  if (!player.hasTag("perk_cheaper_trades")) return;

  player.addEffect("village_hero", TicksPerSecond * 12, {
    amplifier: 0,
    showParticles: false,
  });
}

toAllPlayers(cheaper_trades, 10);