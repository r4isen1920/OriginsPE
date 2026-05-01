
import {  Player } from "@minecraft/server";

import { toAllPlayers } from "../../../origins/player";


function courage(player: Player) {
  if (!player.hasTag('power_courage')) return;

  if (
    player.getEffect('weakness') ||
    player.getEffect('wither')
  ) {

    player.removeEffect('weakness');
    player.removeEffect('wither');

  }
}

toAllPlayers(courage, 3);
