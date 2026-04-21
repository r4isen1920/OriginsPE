
/*
Legacy JS source kept intentionally during TS migration.
Active implementation now lives in aerial_combatant.ts.

import { toAllPlayers } from "../../../origins/player";

/**
 *
 * @param { import('@minecraft/server').Player } player
 *
function aerial_combatant(player) {
  if (
    !player.hasTag('power_aerial_combatant') ||
    !player.isGliding
  ) {
    player.triggerEvent('r4isen1920_originspe:attack.1');
    return
  }

  player.triggerEvent('r4isen1920_originspe:attack.10')
}

toAllPlayers(aerial_combatant, 2)
*/
