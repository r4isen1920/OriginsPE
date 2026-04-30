import {
  EntityDamageCause,
  Player,
  system,
  TicksPerSecond,
} from "@minecraft/server";

import { toAllPlayers } from "../../../origins/player";

const FRESH_AIR_COOLDOWN_TAG = "fresh_air_sleep_cooldown";
const FRESH_AIR_COOLDOWN_TICKS = TicksPerSecond;
const FRESH_AIR_CHECK_INTERVAL = TicksPerSecond / 2;

function fresh_air(player: Player): void {
  if (
    !player.hasTag("power_fresh_air") ||
    !player.isSleeping ||
    player.location.y > 135
  )
    return;
  if (player.hasTag(FRESH_AIR_COOLDOWN_TAG)) return;

  player.applyDamage(2, { cause: EntityDamageCause.entityAttack });
  const health = player.getComponent("health");
  if (health) {
    const current =
      typeof health.currentValue === "number" ? health.currentValue : 0;
    health.setCurrentValue(current + 2);
  }

  player.onScreenDisplay.setActionBar(
    "origins.hud.overhead_text:origins.trait.fresh_air.sleep_fail",
  );

  player.addTag(FRESH_AIR_COOLDOWN_TAG);
  system.runTimeout(() => {
    if (player.isValid) {
      player.removeTag(FRESH_AIR_COOLDOWN_TAG);
    }
  }, FRESH_AIR_COOLDOWN_TICKS);
}

toAllPlayers(fresh_air, FRESH_AIR_CHECK_INTERVAL);
