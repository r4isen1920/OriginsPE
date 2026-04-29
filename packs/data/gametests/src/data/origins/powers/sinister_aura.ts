//sinister_aura.ts
import type { Player } from "@minecraft/server";
import { toAllPlayers } from "../../../origins/player";

function sinister_aura(_player: Player): boolean {
  return true;
}

toAllPlayers(sinister_aura, 1);
