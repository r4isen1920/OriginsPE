
import { Player } from "@minecraft/server";

import { toAllPlayers } from "../../../origins/player";
import { Vector3 } from "../../../utils/Vec3";


function hotblooded(player: Player) {
  if (!player.hasTag('power_hotblooded')) return;

  if (
    player.getEffect('poison') ||
    player.getEffect('fatal_poison') ||
    player.getEffect('hunger')
  ) {

    player.removeEffect('poison');
    player.removeEffect('fatal_poison');
    player.removeEffect('hunger');

    player.dimension.playSound('random.fizz', player.location, { pitch: 1.25 });
    player.dimension.spawnParticle('minecraft:lava_particle', Vector3.add(player.location, new Vector3(0, 0.75, 0)));

  }


}

toAllPlayers(hotblooded, 3);
