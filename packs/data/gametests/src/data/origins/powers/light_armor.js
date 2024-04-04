
import { ItemStack, EquipmentSlot } from "@minecraft/server";
import { toAllPlayers } from "../../../origins/player";

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function light_armor(player) {
  if (!player.hasTag('power_light_armor')) return

  /**
   * @param { import('@minecraft/server').EquipmentSlot } slot 
   * @returns { string | undefined }
   */
  const fetchArmor = function(slot) {
    return player.getComponent('equippable').getEquipment(slot)?.typeId
  }

  const currentArmor = [
    fetchArmor(EquipmentSlot.Head),
    fetchArmor(EquipmentSlot.Chest),
    fetchArmor(EquipmentSlot.Legs),
    fetchArmor(EquipmentSlot.Feet)
  ]
  const heavyArmorTags = [
    'netherite_',
    'diamond_',
    'golden_',
    'iron_'
  ]

  if (currentArmor.some(armor => heavyArmorTags.some(tag => armor?.includes(tag)))) {
    player.triggerEvent('r4isen1920_originspe:movement.0.05');
    player.addTag('_heavy')
  } else {
    player.triggerEvent('r4isen1920_originspe:movement.0.1');
    player.removeTag('_heavy')
  }

}

toAllPlayers(light_armor, 4)
