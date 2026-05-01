//slow_falling.ts
import { TicksPerSecond } from "@minecraft/server";

import { toAllPlayers } from "../../../origins/player";
import { Vector3 } from "../../../utils/vec3";
import type { Player } from "@minecraft/server";

const SLOW_FALLING_CHECK_INTERVAL = TicksPerSecond;
const SLOW_FALLING_EFFECT_DURATION = TicksPerSecond * 3;

function slow_falling(player: Player): void {
  if (!player.hasTag("power_slow_falling")) return;

  const block = player.dimension.getBlock(
    Vector3.add(player.location, new Vector3(0, -1, 0)),
  );

  if (block && block.permutation.matches("minecraft:air"))
    player.addEffect("slow_falling", SLOW_FALLING_EFFECT_DURATION, {
      amplifier: 3,
      showParticles: false,
    });
  else if (player.getEffect("slow_falling"))
    player.removeEffect("slow_falling");
}

toAllPlayers(slow_falling, SLOW_FALLING_CHECK_INTERVAL);
