
import { toAllPlayers } from "../../../origins/player";

import { Player } from "@minecraft/server";

function gluttony(player: Player) {

  if (!player.hasTag('power_gluttony')) return;

  player.triggerEvent('r4isen1920_originspe:exhaustion.piglin');

}

toAllPlayers(gluttony, 1);
