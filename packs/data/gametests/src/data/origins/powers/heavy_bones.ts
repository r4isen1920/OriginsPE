import { toAllPlayers } from "../../../origins/player";

import { Player } from "@minecraft/server";

// Makes players with the 'power_heavy_bones' tag move slowly in water.

function heavyBones(player: Player) {
  if (!player.hasTag('power_heavy_bones')) return;

  if (player.isInWater) {
    player.triggerEvent('r4isen1920_originspe:underwater_movement.0.005');
  } else {
    player.triggerEvent('r4isen1920_originspe:underwater_movement.0.01');
  }
}

toAllPlayers(heavyBones, 5);