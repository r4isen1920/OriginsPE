
import { toAllPlayers } from "../../../origins/player";
import { Player } from "@minecraft/server";

function lifespan(player: Player) {

  if (!player.hasTag('power_lifespan')) return;

  player.triggerEvent('r4isen1920_originspe:health.14');

}

toAllPlayers(lifespan, 4);
