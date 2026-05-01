
import { world, system, TicksPerSecond, Player } from "@minecraft/server";

import { toAllPlayers } from "../../../origins/player";
import { ResourceBar } from "../../../origins/resource_bar";

const ACCUMULATED_DAMAGE_KEY = 'r4isen1920_originspe:accumulated_damage';

function getAccumulatedDamage(player: Player): number {
  const value = player.getDynamicProperty(ACCUMULATED_DAMAGE_KEY);
  return typeof value === 'number' ? value : 0;
}


function lifeweaver(player: Player): void {
  const accumulatedDamage = getAccumulatedDamage(player);

  if (
    !player.hasTag('power_lifeweaver') &&
    accumulatedDamage < 1
  ) return;

  if (
    accumulatedDamage > 0 &&
    !player.hasTag('cooldown_lifeweaver')   
  ) {
    player.addTag('cooldown_lifeweaver');
    /**
     * @type { import('@minecraft/server').EntityHealthComponent }
      */
    const health = player.getComponent('health');
    if (!health) return;

    const addedHealth = Math.ceil(health.currentValue + accumulatedDamage);

    health.setCurrentValue(
      Math.clamp(addedHealth, health.effectiveMin, health.effectiveMax)
    );
    player.addEffect('absorption', TicksPerSecond * 12, { amplifier: Math.floor(accumulatedDamage * 0.02) });
    player.removeEffect('regeneration');

    player.dimension.spawnParticle('r4isen1920_originspe:elven_heal', {
      x: player.location.x,
      y: player.location.y + 1,
      z: player.location.z,
    });
    player.dimension.playSound('ender_eye.dead', player.location, { volume: 2.0, pitch: 1.25 });

    player.setDynamicProperty(ACCUMULATED_DAMAGE_KEY, 0);
    player.addTag('_lifeweaver_on_trigger');

    system.runTimeout(() => {
      player.removeTag('cooldown_lifeweaver');
    }, TicksPerSecond * 30);

  } // else player.addEffect('regeneration', TicksPerSecond * 12, { amplifier: 0 })
}

toAllPlayers(lifeweaver, 3);

system.runTimeout(() => {

  /**
   * 
   * Intercept when player gets hurt
   */
  world.afterEvents.entityHurt.subscribe(
    event => {

      const { damage, hurtEntity } = event;
      if (
        hurtEntity.typeId !== 'minecraft:player' ||
        !hurtEntity.hasTag('power_lifeweaver') ||
        damage < 1
      ) return;

      const hurtPlayer = hurtEntity as Player;
      const accumulatedDamage = getAccumulatedDamage(hurtPlayer);

      if (
        accumulatedDamage > 1 &&
        hurtPlayer.hasTag('cooldown_lifeweaver') &&
        hurtPlayer.hasTag('_lifeweaver_on_trigger')
      ) {

        hurtPlayer.removeTag('cooldown_lifeweaver');
        hurtPlayer.removeTag('_lifeweaver_on_trigger');

      }

      if (!hurtPlayer.hasTag('cooldown_lifeweaver'))
        new ResourceBar(16, 0, 100, 3, false).push(hurtPlayer);

      hurtPlayer.setDynamicProperty(
        ACCUMULATED_DAMAGE_KEY,
        accumulatedDamage + damage
      );
    }
  );

}, TicksPerSecond * 4);
