import { TicksPerSecond, type EntityHealthComponent, type Player } from "@minecraft/server";

import { toAllPlayers } from "../../../origins/player";


/**
 * 
 * Gives the player a strength boost when their health is low,
 * but only if they have the "perk_less_health_more_attack" tag
 * 
 */

function less_health_more_attack(player: Player) {
  if (!player.hasTag("perk_less_health_more_attack")) return;

  const playerHealth = player.getComponent("health") as EntityHealthComponent;

  const playerHealthPercentage = Math.floor(
    (playerHealth.effectiveMax / playerHealth.currentValue) * 100,
  );
  if (playerHealthPercentage >= 75) return;

  player.addEffect("strength", TicksPerSecond * 3, {
    amplifier: Math.clamp(Math.floor(playerHealthPercentage / 25), 0, 1),
    showParticles: false,
  });
}

toAllPlayers(less_health_more_attack, 5);