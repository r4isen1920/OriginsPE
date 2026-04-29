
import { TicksPerSecond, Player } from "@minecraft/server";
import { toAllPlayers } from "../../../origins/player";


function cat_vision(player: Player) {

  if (!player.hasTag('power_cat_vision')) return;

  player.triggerEvent('r4isen1920_originspe:light_level');
  const lightLevel = Number(player.getProperty('r4isen1920_originspe:light_level') ?? 0);

  if (lightLevel < 8) {
    player.addEffect('night_vision', TicksPerSecond * 12, { showParticles: false });
    player.addEffect('strength', TicksPerSecond * 12, { amplifier: 0, showParticles: false });
  } else {
    player.removeEffect('night_vision');
    player.removeEffect('strength');
  }

}

toAllPlayers(cat_vision, 3);
