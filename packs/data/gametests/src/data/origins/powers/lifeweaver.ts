
import { world, system, TicksPerSecond } from "@minecraft/server";

import { toAllPlayers } from "../../../origins/player";
import type { Player } from "@minecraft/server";
import { ResourceBar } from "../../../origins/resource_bar";
import { Vector3 } from "../../../utils/Vec3";

const ACCUMULATED_DAMAGE_KEY = 'r4isen1920_originspe:accumulated_damage';

function getAccumulatedDamage(player: Player): number {
  const value = player.getDynamicProperty(ACCUMULATED_DAMAGE_KEY);
  return typeof value === 'number' ? value : 0;
}


function lifeweaver(Player: Player): void {
  const accumulatedDamage = getAccumulatedDamage(Player);

  if (
    !Player.hasTag('power_lifeweaver') &&
    accumulatedDamage < 1
  ) return;

  if (
    accumulatedDamage > 0 &&
    !Player.hasTag('cooldown_lifeweaver')   
  ) {
    Player.addTag('cooldown_lifeweaver');
    /**
     * @type { import('@minecraft/server').EntityHealthComponent }
      */
    const health = Player.getComponent('health');
    if (!health) return;

    const addedHealth = Math.ceil(health.currentValue + accumulatedDamage)

    health.setCurrentValue(
      Math.clamp(addedHealth, health.effectiveMin, health.effectiveMax)
    )
    Player.addEffect('absorption', TicksPerSecond * 12, { amplifier: Math.floor(accumulatedDamage * 0.02) });
    Player.removeEffect('regeneration');

    Player.dimension.spawnParticle('r4isen1920_originspe:elven_heal', Vector3.add(Player.location, new Vector3(0, 1, 0)));
    Player.dimension.playSound('ender_eye.dead', Player.location, { volume: 2.0, pitch: 1.25 });

    Player.setDynamicProperty(ACCUMULATED_DAMAGE_KEY, 0);
    Player.addTag('_lifeweaver_on_trigger');

    system.runTimeout(() => {
      Player.removeTag('cooldown_lifeweaver');
    }, TicksPerSecond * 30);

  } // else Player.addEffect('regeneration', TicksPerSecond * 12, { amplifier: 0 })
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
        new ResourceBar(16, 0, 100, 3, false).push(hurtPlayer)

      hurtPlayer.setDynamicProperty(
        ACCUMULATED_DAMAGE_KEY,
        accumulatedDamage + damage
      )
    }
  )

}, TicksPerSecond * 4)
