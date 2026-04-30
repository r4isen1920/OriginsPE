import { toAllPlayers } from "../../../origins/player";
import { Player } from "@minecraft/server";

function land_breathing_grace(player: Player) {
  if (
    !player.hasTag('power_water_breathing') ||
    player.hasTag('land_breathing_grace_given')
  ) return;

  // Use the built-in API to add the Water Breathing effect by string id
  player.addEffect("minecraft:water_breathing", 60, {});
  player.addTag('land_breathing_grace_given');
}

toAllPlayers(land_breathing_grace, 3);