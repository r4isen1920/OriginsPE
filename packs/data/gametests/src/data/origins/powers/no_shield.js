
import { EquipmentSlot, world } from "@minecraft/server";

import { toAllPlayers } from "../../../origins/player";
import { Vector3 } from "../../../utils/Vec3";

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function no_shield(player) {

  if (!player.hasTag('power_no_shield') || !player.isSneaking) return

  /**
   * @param { import('@minecraft/server').EquipmentSlot } slot 
   * @returns { import('@minecraft/server').ItemStack | null }
   */
  const playerEquipment = function(slot) {
    return player.getComponent('equippable').getEquipment(slot)
  }

  switch (true) {

    case playerEquipment(EquipmentSlot.Offhand)?.typeId === 'minecraft:shield':
      player.getComponent('equippable').setEquipment(EquipmentSlot.Offhand, undefined);
      onShieldBroken(player);
      break

    case playerEquipment(EquipmentSlot.Mainhand)?.typeId === 'minecraft:shield':
      player.getComponent('equippable').setEquipment(EquipmentSlot.Mainhand, undefined);
      onShieldBroken(player);
      break

  }

}

toAllPlayers(no_shield, 1)

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function onShieldBroken(player) {

  world.playSound('random.break', player.location);
  player.dimension.spawnParticle('r4isen1920_originspe:shield_break', Vector3.add(player.location, new Vector3(0, 0.5, 0)));

}
