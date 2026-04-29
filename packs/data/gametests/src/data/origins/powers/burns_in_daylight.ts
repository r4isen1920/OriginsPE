
import { GameMode, Player, TicksPerSecond } from "@minecraft/server";

import { toAllPlayers } from "../../../origins/player";


function burns_in_daylight(player: Player) {
  if (!player.hasTag('power_burns_in_daylight')) return;

  apply_burns(player);
}

function apply_burns(player: Player) {
  player.setGameMode(GameMode.Spectator);
  const inSpectatorMode = player.getGameMode() === GameMode.Spectator;

  if (inSpectatorMode) player.triggerEvent('r4isen1920_originspe:burns_in_daylight.true');
  else player.triggerEvent('r4isen1920_originspe:burns_in_daylight.false');
}

toAllPlayers(burns_in_daylight, TicksPerSecond * 1);
