//no_projectile_divergence.ts
import type { Player } from "@minecraft/server";

function no_projectile_divergence(_player: Player): boolean {
  return true;
}

export { no_projectile_divergence };
