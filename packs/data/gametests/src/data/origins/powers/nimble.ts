//nimble.ts
import type { Player } from "@minecraft/server";
import { toAllPlayers } from "../../../origins/player";

function nimble(_player: Player): boolean {
  return true;
}

toAllPlayers(nimble, 1);
