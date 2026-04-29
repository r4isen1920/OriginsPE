//undead.ts
import { TicksPerSecond } from "@minecraft/server";

import { toAllPlayers } from "../../../origins/player";

import type { Player } from "@minecraft/server";

function undead(player: Player): void {
  if (!player.hasTag("power_undead")) return;

  player.triggerEvent("r4isen1920_originspe:family_type.undead");
}

toAllPlayers(undead, TicksPerSecond * 1);
