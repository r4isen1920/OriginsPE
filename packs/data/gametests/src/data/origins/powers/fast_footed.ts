
import { toAllPlayers } from "../../../origins/player";
import { Player } from "@minecraft/server";


function fast_footed(player: Player) {

  if (
    !player.hasTag('power_fast_footed') ||
    player.hasTag('_scale_set')
  ) return;

  player.triggerEvent('r4isen1920_originspe:movement.0.1425');
  player.triggerEvent('r4isen1920_originspe:scale.0.75');

  player.addTag('_scale_set');

}

toAllPlayers(fast_footed, 3);
