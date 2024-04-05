
import { TicksPerSecond } from "@minecraft/server";
import { toAllPlayers } from "../../../origins/player";
import { searchItemId } from "../../../utils/items";

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function pumpkin_hate(player) {

  if (
    !player.hasTag('power_pumpkin_hate') ||
    !searchItemId(player, 'pumpkin')
  ) {
    player.triggerEvent('r4isen1920_originspe:is_shaking.false');
    return
  }

  player.triggerEvent('r4isen1920_originspe:is_shaking.true');
  player.addEffect('weakness', TicksPerSecond * 12, { amplifier: 1 })

}

toAllPlayers(pumpkin_hate, 3)
