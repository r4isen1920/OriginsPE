
/**
 * 
 * @param { import('@minecraft/server').Player } attacker 
 * @param { import('@minecraft/server').Entity } hurtEntity 
 */
export function life_drain(attacker, hurtEntity) {

  /**
   * @type { import('@minecraft/server').EntityHealthComponent }
    */
  const attackerHealth = attacker.getComponent('health');
  /**
   * @type { import('@minecraft/server').EntityHealthComponent }
    */
  const attackedHealth = hurtEntity.getComponent('health');
  const healthDecrementValue = Math.min(
    (attackedHealth.effectiveMax - attackedHealth.currentValue),
    attackerHealth.effectiveMax * 0.5
  )

  attackerHealth.setCurrentValue(
    Math.round(Math.max(attackerHealth.currentValue - healthDecrementValue, 2))
  );

}
