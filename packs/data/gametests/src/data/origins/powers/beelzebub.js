
import { world, system, TicksPerSecond, EntityDamageCause } from "@minecraft/server";

import { ResourceBar } from "../../../origins/resource_bar";
import { toAllPlayers } from "../../../origins/player";
import { MathR4 } from "../../../utils/Math";
import { Vector3 } from "../../../utils/Vec3";

const BAR_VALUES = [0, 29, 71, 100, 100];

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function beelzebub(player) {
  if (!player.hasTag('power_beelzebub')) return;

  if (!player.hasTag('_init_bar')) {
    const phase = getBeelzebubProperty(player);
    new ResourceBar(19, BAR_VALUES[phase], BAR_VALUES[phase], 1, true).push(player);

    player.addTag('_init_bar');
  }

}

toAllPlayers(beelzebub, 5)

system.runTimeout(() => {

  world.afterEvents.entityHurt.subscribe(
    event => {

      const { damage, damageSource, hurtEntity } = event;
      if (
        !damageSource.damagingEntity?.hasTag('power_beelzebub') ||
        damageSource.cause !== EntityDamageCause.entityAttack
      ) return;

      /**
       * @type { import('@minecraft/server').Player }
       */
      const attacker = damageSource.damagingEntity;
      if (attacker.hasTag('cooldown_20')) return;

      const PITCH_VALUES = [ 1.25, 1.5, 1.75, 1.75 ];
      const phase = getBeelzebubProperty(attacker);

      new ResourceBar(19, BAR_VALUES[phase], BAR_VALUES[phase + 1], 1, true).push(attacker);
      incrementBeelzebubProperty(attacker);
      incrementBeelzebubProperty(attacker, 'dmg', damage);

      attacker.dimension.spawnParticle(
        `r4isen1920_originspe:voidwalker_beelzebub_phase_${phase}`,
        Vector3.add(
          attacker.getHeadLocation(),
          Vector3.multiply(attacker.getViewDirection(), 1.25)
        )
      )
      attacker.playSound('ui.enchant', { volume: 2.0, pitch: PITCH_VALUES[phase] });

      const attackerHealth = attacker.getComponent('health')
      hurtEntity.applyDamage(attackerHealth.effectiveMax - attackerHealth.currentValue, { cause: EntityDamageCause.entityAttack, damagingEntity: attacker })

    }
  )

}, TicksPerSecond * 6)

/**
 * 
 * @param { import('@minecraft/server').Player } attacker 
 * @param { 'phase' | 'dmg' } type 
 * @returns { number }
 */
export function getBeelzebubProperty(attacker, type='phase') {
  return attacker.getDynamicProperty(`r4isen1920_originspe:beelzebub_${type}`) || 0
}

/**
 * 
 * @param { import('@minecraft/server').Player } attacker 
 * @param { 'phase' | 'dmg' } type 
 * @param { number } incrementValue 
 */
export function incrementBeelzebubProperty(attacker, type='phase', incrementValue=1) {
  return attacker.setDynamicProperty(`r4isen1920_originspe:beelzebub_${type}`, type === 'phase' ? MathR4.clamp(getBeelzebubProperty(attacker, type) + incrementValue, 0, 4) : getBeelzebubProperty(attacker, type) + incrementValue)
}
