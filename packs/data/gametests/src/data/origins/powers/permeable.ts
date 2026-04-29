import { Player } from "@minecraft/server";
import { toAllPlayers } from "../../../origins/player";

function permeable(_player: Player): boolean {
  return true;
}
toAllPlayers(permeable, 1);
