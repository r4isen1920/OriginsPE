
import { toAllPlayers } from "../../../origins/player";
import { Player } from "@minecraft/server";

function fragile(player: Player) {

  if (!player.hasTag('power_fragile')) return;

  player.triggerEvent('r4isen1920_originspe:health.14');
  player.removeTag('power_fragile');

}

toAllPlayers(fragile, 1);
