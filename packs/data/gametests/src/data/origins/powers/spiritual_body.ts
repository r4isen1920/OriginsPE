//spiritual_body.ts
import type { Player } from "@minecraft/server";
import { toAllPlayers } from "../../../origins/player";

function spiritual_body(_player: Player): boolean {
  return true;
}

toAllPlayers(spiritual_body, 1);
