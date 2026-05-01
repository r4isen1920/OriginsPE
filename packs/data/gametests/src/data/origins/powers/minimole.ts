//minimole.ts
import { world, Player } from "@minecraft/server";
import { toAllPlayers } from "../../../origins/player";


function minimole(player: Player): void {
  if (!player.hasTag("power_minimole")) return;

  player.triggerEvent("r4isen1920_originspe:scale.0.5");
  player.triggerEvent("r4isen1920_originspe:health.14");

  player.camera.setCamera("r4isen1920_originspe:small");

  const location = player.location;
  const block = world.getDimension(player.dimension.id).getBlock({
    x: Math.floor(location.x),
    y: Math.floor(location.y) + 1,
    z: Math.floor(location.z),
  });
  if (block && !block.isAir) {
    player.addEffect("speed", 20, { amplifier: 2, showParticles: false });
  }
}

toAllPlayers(minimole, 5);
