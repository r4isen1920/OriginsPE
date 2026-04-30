import { Player, Entity } from "@minecraft/server";


export function life_drain(attacker: Player, hurtEntity: Entity) {

  const attackerHealth = attacker.getComponent('health');
  const attackedHealth = hurtEntity.getComponent('health');

  if (!attackerHealth || !attackedHealth) return;

  const healthDecrementValue = Math.min(
    (attackedHealth.effectiveMax - attackedHealth.currentValue),
    attackerHealth.effectiveMax * 0.5
  );

  attackerHealth.setCurrentValue(
    Math.round(Math.max(attackerHealth.currentValue - healthDecrementValue, 2))
  );

}
