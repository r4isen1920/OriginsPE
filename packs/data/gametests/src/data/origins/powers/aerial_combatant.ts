import type { Player } from "@minecraft/server";

import { toAllPlayers } from "../../../origins/player";

function aerial_combatant(player: Player): void {
  if (!player.hasTag("power_aerial_combatant") || !player.isGliding) {
    player.triggerEvent("r4isen1920_originspe:attack.1");
    return;
  }

  player.triggerEvent("r4isen1920_originspe:attack.10");
}

toAllPlayers(aerial_combatant, 2);