//more_exhaustion.ts
import { toAllPlayers } from "../../../origins/player";

import type { Player } from "@minecraft/server";

function more_exhaustion(player: Player): void {
  if (!player.hasTag("power_more_exhaustion")) return;

  player.triggerEvent("r4isen1920_originspe:exhaustion.shulk");
}

toAllPlayers(more_exhaustion, 1);
