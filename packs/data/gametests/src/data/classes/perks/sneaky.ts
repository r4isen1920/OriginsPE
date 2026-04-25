//sneaky.ts
import { type Player } from "@minecraft/server";
import { toAllPlayers } from "../../../origins/player";

function sneaky(player: Player): void {
  if (!player.hasTag("perk_sneaky")) return;

  player.triggerEvent("r4isen1920_originspe:display_name.false");
}

toAllPlayers(sneaky, 5);
