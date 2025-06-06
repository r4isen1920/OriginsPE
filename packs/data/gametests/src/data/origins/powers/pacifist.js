import { toAllPlayers } from "../../../origins/player";

export function pacifist(player) {
   if (player.hasTag("power_pacifist")) {
      player.triggerEvent('r4isen1920_originspe:attack.0')
   }
}

toAllPlayers(pacifist, 20);
