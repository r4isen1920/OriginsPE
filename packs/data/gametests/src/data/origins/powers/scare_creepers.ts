//scare_creepers.ts
import { toAllPlayers } from "../../../origins/player";

import type { Player } from "@minecraft/server";

function scare_creepers(player: Player): void {
  if (!player.hasTag("power_scare_creepers")) return;

  const nearbyEntities = player.dimension.getEntities({
    location: player.location,
    maxDistance: 16,
    type: "minecraft:creeper",
  });

  for (const creeper of nearbyEntities) {
    creeper.triggerEvent("minecraft:stop_exploding");
    creeper.clearVelocity();

    const dx = creeper.location.x - player.location.x;
    const dz = creeper.location.z - player.location.z;
    const distance = Math.sqrt(dx * dx + dz * dz);

    if (distance < 10) {
      creeper.applyImpulse({
        x: (dx / distance) * 0.8,
        y: 0.2,
        z: (dz / distance) * 0.8,
      });
    }

    creeper.addTag("scared_by_cat");
  }

  player.triggerEvent("r4isen1920_originspe:family_type.cat");
}

toAllPlayers(scare_creepers, 3);
