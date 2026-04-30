
import { toAllPlayers } from "../../../origins/player";
import { Player } from "@minecraft/server";

function like_water(player: Player) {

  if (
    !player.hasTag('power_like_water') ||
    player.isSneaking ||
    player.isSwimming
  ) {
    player.triggerEvent('r4isen1920_originspe:buoyant.normal');
    return;
  }

  player.triggerEvent('r4isen1920_originspe:buoyant.float_on_water');

}

toAllPlayers(like_water, 3);
