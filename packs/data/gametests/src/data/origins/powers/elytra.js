
import { EquipmentSlot, ItemLockMode, ItemStack } from "@minecraft/server";

import { toAllPlayers } from "../../../origins/player";

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function elytra(player) {

  if (!player.hasTag('power_elytra')) {

    const playerEquipment = player.getComponent('equippable');
    if (playerEquipment) {
      /**
       * @type { string[] }
       */
      const lore = playerEquipment.getEquipment(EquipmentSlot.Chest)?.getLore()
      if (!lore.includes('OriginsPE')) return
      playerEquipment.setEquipment(EquipmentSlot.Chest, undefined)
    }

    return
  }

  if (player.getComponent('equippable').getEquipment(EquipmentSlot.Chest)?.typeId === 'minecraft:elytra') return

  const newElytra = new ItemStack('minecraft:elytra')
  newElytra.lockMode = ItemLockMode.slot
  newElytra.setLore(['OriginsPE'])

  player.getComponent('equippable').setEquipment(EquipmentSlot.Chest, newElytra)
}

toAllPlayers(elytra, 5)
