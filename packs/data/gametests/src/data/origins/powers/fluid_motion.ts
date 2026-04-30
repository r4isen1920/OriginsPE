import { toAllPlayers } from "../../../origins/player";
import { Player } from "@minecraft/server";


function fluidMotion(player: Player) {
  if (!player.hasTag('power_fluid_motion')) return;

  if (player.isInWater) {
    // Increase movement speed only while in water
    player.triggerEvent('r4isen1920_originspe:underwater_movement.0.05');
  } else {
    // Reset to normal movement speed when not in water
    player.triggerEvent('r4isen1920_originspe:underwater_movement.0.01');
  }
}

toAllPlayers(fluidMotion, 5);