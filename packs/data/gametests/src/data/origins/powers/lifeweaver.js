
import { world, system, TicksPerSecond } from "@minecraft/server";

import { toAllPlayers } from "../../../origins/player";
import { ResourceBar } from "../../../origins/resource_bar";
import { Vector3 } from "../../../utils/Vec3";

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function lifeweaver(player) {
  if (
    !player.hasTag('power_lifeweaver') ||
    (player.getDynamicProperty('r4isen1920_originspe:accumulated_damage') || 0) < 1
  ) return

  if (
    (player.getDynamicProperty('r4isen1920_originspe:accumulated_damage') || 0) > 0 &&
    !player.hasTag('cooldown_16')
  ) {

    /**
     * @type { import('@minecraft/server').EntityHealthComponent }
      */
    const health = player.getComponent('health');
    const addedHealth = Math.ceil(health.currentValue + player.getDynamicProperty('r4isen1920_originspe:accumulated_damage'))

    health.setCurrentValue(
      Math.clamp(addedHealth, health.effectiveMin, health.effectiveMax)
    )
    player.addEffect('absorption', TicksPerSecond * 12, { amplifier: Math.floor(player.getDynamicProperty('r4isen1920_originspe:accumulated_damage') / 4) });
    player.removeEffect('regeneration');

    player.dimension.spawnParticle('r4isen1920_originspe:elven_heal', Vector3.add(player.location, new Vector3(0, 1, 0)));
    world.playSound('ender_eye.dead', player.location, { volume: 2.0, pitch: 1.25 });

    player.setDynamicProperty('r4isen1920_originspe:accumulated_damage', 0);
    player.addTag('_lifeweaver_on_trigger');

  } else player.addEffect('regeneration', TicksPerSecond * 12, { amplifier: 0 })
}

toAllPlayers(lifeweaver, 3)

system.runTimeout(() => {

  /**
   * 
   * Intercept when player gets hurt
   */
  world.afterEvents.entityHurt.subscribe(
    event => {

      const { damage, hurtEntity } = event;
      if (
        !hurtEntity.hasTag('power_lifeweaver') ||
        damage < 1
      ) return;

      if (
        (hurtEntity.getDynamicProperty('r4isen1920_originspe:accumulated_damage') || 0) > 1 &&
        hurtEntity.hasTag('cooldown_16') &&
        hurtEntity.hasTag('_lifeweaver_on_trigger')
      ) {

        hurtEntity.removeTag('cooldown_16');
        hurtEntity.removeTag('_lifeweaver_on_trigger');

      }

      if (!hurtEntity.hasTag('cooldown_16'))
        new ResourceBar(16, 0, 100, 3, false).push(hurtEntity)

      hurtEntity.setDynamicProperty(
        'r4isen1920_originspe:accumulated_damage',
        (hurtEntity.getDynamicProperty('r4isen1920_originspe:accumulated_damage') || 0) + damage
      )
    }
  )

}, TicksPerSecond * 4)
