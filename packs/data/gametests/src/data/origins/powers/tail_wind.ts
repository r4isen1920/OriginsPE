//tail_wind.ts
import { TicksPerSecond } from "@minecraft/server";
import { toAllPlayers } from "../../../origins/player";

import type { Player } from "@minecraft/server";

const TAIL_WIND_CHECK_INTERVAL = TicksPerSecond * 2;

function tail_wind(player: Player): void {
  if (!player.hasTag("power_tail_wind")) return;

  player.triggerEvent("r4isen1920_originspe:movement.0.15");
}

toAllPlayers(tail_wind, TAIL_WIND_CHECK_INTERVAL);
