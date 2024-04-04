
import { EquipmentSlot, ItemLockMode, ItemStack } from "@minecraft/server";

import { toAllPlayers } from "../../../origins/player";

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function elytra(player) {
  if (player.getComponent('equippable').getEquipment(EquipmentSlot.Chest)?.typeId === 'minecraft:elytra') return

  if (!player.hasTag('power_elytra')) {

    const elytra = player.getComponent('equippable').getEquipment(EquipmentSlot.Chest);
    if (elytra) {
      /**
       * @type { string[] }
       */
      const lore = elytra.getLore()
      if (!lore.includes('OriginsPE')) return
      elytra.setEquipment(EquipmentSlot.Chest, undefined)
    }

    return
  }

  const newElytra = new ItemStack('minecraft:elytra')
  newElytra.lockMode = ItemLockMode.slot
  newElytra.setLore(['OriginsPE'])

  player.getComponent('equippable').setEquipment(EquipmentSlot.Chest, newElytra)
}

toAllPlayers(elytra, 5)
