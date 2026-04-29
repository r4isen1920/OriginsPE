//nine_lives.ts
import { toAllPlayers } from "../../../origins/player";

import type { Player } from "@minecraft/server";

function nine_lives(player: Player): void {
  if (!player.hasTag("power_nine_lives")) return;

  player.triggerEvent("r4isen1920_originspe:health.18");
}

toAllPlayers(nine_lives, 2);
