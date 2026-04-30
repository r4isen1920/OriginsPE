
import { world, system, TicksPerSecond, EntityDamageCause, Player } from "@minecraft/server";

import { ResourceBar } from "../../../origins/resource_bar";
import { toAllPlayers } from "../../../origins/player";
import { Vector3 } from "../../../utils/vec3";

import { life_drain } from "./life_drain";
import { soulburst } from "./soulburst";

const BAR_VALUES = [0, 29, 71, 100, 100];
const debounceMap = new Map<string, number>();

function beelzebub(player: Player) {
  if (!player.hasTag('power_beelzebub')) return;

  if (!player.hasTag('_init_bar')) {
    const phase = getBeelzebubProperty(player);
    new ResourceBar(19, BAR_VALUES[phase], BAR_VALUES[phase], 1, true).push(player);

    player.addTag('_init_bar');
  }

}

toAllPlayers(beelzebub, 3);

system.runTimeout(() => {

  world.afterEvents.entityHurt.subscribe(
    event => {

      const { damage, damageSource, hurtEntity } = event;
      const attackerEntity = damageSource.damagingEntity;
      if (
        !attackerEntity ||
        attackerEntity.typeId !== 'minecraft:player' ||
        !attackerEntity.hasTag('power_beelzebub') ||
        damageSource.cause !== EntityDamageCause.entityAttack
      ) return;

      const attacker = attackerEntity as Player;
      if (hurtEntity.typeId !== 'minecraft:player') return;

      const hurtPlayer = hurtEntity as Player;

      //* Event debounce
      const attackerId = JSON.stringify(attacker.id);
      const oldLog = debounceMap.get(attackerId) || 0;
      debounceMap.set(attackerId, Date.now());
      if ((oldLog + 150) >= Date.now()) return;

      //* Target filter
      hurtPlayer.addTag(`_beelzebub_target_${attacker.id}`);

      //* Events trigger
      soulburst(attacker, hurtPlayer);
      life_drain(attacker, hurtPlayer);

      const phase = getBeelzebubProperty(attacker);

      new ResourceBar(19, BAR_VALUES[phase], BAR_VALUES[phase + 1], 1, true).push(attacker);
      incrementBeelzebubProperty(attacker);
      incrementBeelzebubProperty(attacker, 'dmg', damage);

      attacker.dimension.spawnParticle(
        `r4isen1920_originspe:voidwalker_beelzebub_phase_${phase}`,
        Vector3.add(
          attacker.getHeadLocation(),
          Vector3.multiply(attacker.getViewDirection(), 1.75)
        )
      );

      // world.playSound('enchant.sweeping_edge.hit', hurtEntity.location, { volume: 0.75, pitch: 1.25 });

      const attackerHealth = attacker.getComponent('health');
      attacker.runCommand(`damage @e[tag="_beelzebub_target_${attacker.id}",c=1] ${Math.ceil(attackerHealth.effectiveMax - attackerHealth.currentValue)}`);

    }
  );

}, TicksPerSecond * 6);

/**
 * 
 * @param { import('@minecraft/server').Player } attacker 
 * @param { 'phase' | 'dmg' } type 
 * @returns { number }
 */
export function getBeelzebubProperty(attacker: Player, type='phase'): number {
  const value = attacker.getDynamicProperty(`r4isen1920_originspe:beelzebub_${type}`);
  return typeof value === 'number' ? value : 0;
}

/**
 * @param { import('@minecraft/server').Player } attacker 
 * @param { 'phase' | 'dmg' } type 
 * @param { number } incrementValue 
 */
export function incrementBeelzebubProperty(attacker: Player, type='phase', incrementValue=1) {
  const currentValue = getBeelzebubProperty(attacker, type);

  return attacker.setDynamicProperty(
    `r4isen1920_originspe:beelzebub_${type}`,
    type === 'phase' ? Math.clamp(currentValue + incrementValue, 0, 4) : currentValue + incrementValue
  );
}
