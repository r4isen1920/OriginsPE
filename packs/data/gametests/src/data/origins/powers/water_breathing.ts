//water_breathing.ts
import { toAllPlayers } from "../../../origins/player";

import type { Player } from "@minecraft/server";

function water_breathing(player: Player): void {
  if (
    !player.hasTag("power_water_breathing") ||
    player.hasTag("_breathable_underwater")
  )
    return;

  player.triggerEvent("r4isen1920_originspe:breathable.underwater");
  player.removeTag("_breathable_land");
}

toAllPlayers(water_breathing, 3);
