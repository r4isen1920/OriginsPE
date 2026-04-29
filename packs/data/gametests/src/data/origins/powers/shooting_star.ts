//shooting_star.ts

import { toAllPlayers } from "../../../origins/player";
import { _SCOREBOARD, ResourceBar } from "../../../origins/resource_bar";

import type { Player } from "@minecraft/server";

function shooting_star(player: Player): void {
  if (
    !player.hasTag("power_shooting_star") ||
    !player.hasTag("_control_use_shooting_star")
  )
    return;

  const stressProperty = "r4isen1920_originspe:stress";
  const currentStressValue = player.getDynamicProperty(stressProperty) || 0;
  if (!currentStressValue) player.setDynamicProperty(stressProperty, 0);

  if (
    player.hasTag("cooldown_11") &&
    (_SCOREBOARD("cd2").getScore(player) === 0 ||
      _SCOREBOARD("cd2").getScore(player) !== 11) &&
    (_SCOREBOARD("cd3").getScore(player) === 0 ||
      _SCOREBOARD("cd3").getScore(player) !== 11)
  )
    player.removeTag("cooldown_11");

  if (!player.hasTag("cooldown_11")) {
    player.addTag("cooldown_11");

    player.triggerEvent(
      "r4isen1920_originspe:projectile_spawner.shooting_star",
    );
    player.playSound("origins.starborne.cast");

    new ResourceBar(11, 0, 100, (currentStressValue ?? 70) ? 6 : 12).push(
      player,
    );
  } else {
    player.playSound("note.bass", { volume: 1, pitch: 1.5 });
  }

  player.removeTag("_control_use_shooting_star");
}

toAllPlayers(shooting_star, 2);
