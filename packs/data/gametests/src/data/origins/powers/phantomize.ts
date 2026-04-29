//phantomize.ts
import { toAllPlayers } from "../../../origins/player";
import { ResourceBar } from "../../../origins/resource_bar";

import type { Player } from "@minecraft/server";

function phantomize(player: Player): void {
  if (!player.hasTag("power_phantomize")) return;

  if (player.hasTag("_control_use_phantomize")) {
    switch (true) {
      case !player.hasTag("_phantomized"):
        enterPhantomizedForm(player);
        break;

      case player.hasTag("_phantomized"):
        exitPhantomizedForm(player);
        break;

      default:
        break;
    }
    return;
  }

  const cooldown = new ResourceBar(5, 100, 0, 2);

  if (player.hasTag("_phantomized")) {
    const isPlayerMoving =
      player.getVelocity().x !== 0 ||
      player.getVelocity().y !== 0 ||
      player.getVelocity().z !== 0;

    if (isPlayerMoving) {
      player.setDynamicProperty("r4isen1920_originspe:move_ticks", 0);

      cooldown.pop(player);

      player.removeTag("_phantomized_stopped_moving");
    } else {
      player.setDynamicProperty(
        "r4isen1920_originspe:move_ticks",
        Math.min(
          ((player.getDynamicProperty(
            "r4isen1920_originspe:move_ticks",
          ) as number) || 0) + 1,
          20,
        ),
      );
      const move_ticks =
        (player.getDynamicProperty(
          "r4isen1920_originspe:move_ticks",
        ) as number) || 0;

      if (!player.hasTag("_phantomized_stopped_moving")) {
        cooldown.push(player);
        player.addTag("_phantomized_stopped_moving");
      }

      if (move_ticks >= 20) {
        exitPhantomizedForm(player);
      }
    }
  }
}

toAllPlayers(phantomize, 2);

function enterPhantomizedForm(player: Player) {
  player.runCommand("gamemode spectator");

  player.playSound("mob.endermen.portal", { pitch: 0.75 });

  player.addTag("_phantomized");
  player.removeTag("_control_use_phantomize");
  player.setDynamicProperty(
    "r4isen1920_originspe:phantomized_start",
    player.location,
  );
}

function exitPhantomizedForm(player: Player) {
  player.runCommand("gamemode survival");

  player.playSound("mob.endermen.portal", { pitch: 0.75 });

  player.removeTag("_phantomized");
  player.removeTag("_control_use_phantomize");
  player.setDynamicProperty("r4isen1920_originspe:move_ticks", 0);
}
