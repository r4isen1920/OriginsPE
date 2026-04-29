//sea_creature.ts
import { toAllPlayers } from "../../../origins/player";

import type { Player } from "@minecraft/server";

function sea_creature(player: Player): void {
  if (!player.hasTag("power_sea_creature")) return;

  player.triggerEvent("r4isen1920_originspe:family_type.fish");
}

toAllPlayers(sea_creature, 3);
