//more_kinetic_damage.ts
import type { Player } from "@minecraft/server";
import { toAllPlayers } from "../../../origins/player";

function more_kinetic_damage(_player: Player): boolean {
  return true;
}

toAllPlayers(more_kinetic_damage, 1);
