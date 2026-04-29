//smaller_heart.ts
import { toAllPlayers } from "../../../origins/player";
import type { Player } from "@minecraft/server";

function smaller_heart(player: Player): void {
  if (!player.hasTag("power_smaller_heart")) return;

  player.triggerEvent("r4isen1920_originspe:health.12");
}

toAllPlayers(smaller_heart, 1);
