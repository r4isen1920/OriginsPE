//natural_armor.ts
import type { Player } from "@minecraft/server";
import { toAllPlayers } from "../../../origins/player";

function natural_armor(_player: Player): boolean {
  return true;
}

toAllPlayers(natural_armor, 1);
