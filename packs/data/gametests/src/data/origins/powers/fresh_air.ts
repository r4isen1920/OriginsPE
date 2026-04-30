
import { EntityDamageCause, Player } from "@minecraft/server";

import { toAllPlayers } from "../../../origins/player";


function fresh_air(player: Player) {
  if (!player.hasTag('power_fresh_air') || !player.isSleeping || player.location.y > 135) return;

  player.applyDamage(2, { cause: EntityDamageCause.entityAttack });
  const health = player.getComponent('health');
  if (health) {
    const current = typeof health.currentValue === 'number' ? health.currentValue : 0;
    health.setCurrentValue(current + 2);
  }

  player.onScreenDisplay.setActionBar('origins.hud.overhead_text:origins.trait.fresh_air.sleep_fail');
}

toAllPlayers(fresh_air, 1);
