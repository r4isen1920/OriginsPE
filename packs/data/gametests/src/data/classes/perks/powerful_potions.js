
import { ItemStack, TicksPerSecond } from "@minecraft/server";

import { toAllPlayers } from "../../../origins/player";
import { findItems } from "../../../utils/items";
import { potency } from "./longer_potions";

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function powerful_potions(player) {
  const potionItemsInInventory = findItems(player).filter(item => items.some(i => (item?.item?.typeId?.includes(`temp_${i.typeId}`) && item?.item?.typeId?.includes('_potent'))))
  if (potionItemsInInventory.length === 0) return;

  for (const item of potionItemsInInventory) {
    const convertItem = new ItemStack(item.item.typeId.replace('r4isen1920_originspe:temp_', 'r4isen1920_originspe:cleric_'), item.item.amount)

    const itemData = items.find(i => item.item.typeId.includes(i.typeId))
    let setLore = []
    itemData.effects.forEach(effect => {
      const effectName = effect.name.replace(/.+_of_|_/gm, ' ').toTitle()
      const amplifier = potency[effect.amplifier] || effect.amplifier
      const duration = Math.floor(effect.duration / 60) + ':' + ((effect.duration % 60).toString().padStart(2, '0'))

      if (effect.amplifier === 0) setLore.push(`§r§7${effectName} (${duration})`);
      else if (effect.duration === 0) setLore.push(`§r§7${effectName} ${amplifier}`);
      else setLore.push(`§r§7${effectName} ${amplifier} (${duration})`);
    })
    if (itemData.whenApplied.length > 0) setLore.push('§r§7', '§r§9When Applied:', ...itemData.whenApplied)
    setLore.push('§r§7', '§r§6Enhanced Potion§r')
    convertItem.setLore(setLore)

    const slotType = item.slot <= 8 ? 'hotbar' : 'inventory'
    const potionType = item?.item?.typeId?.includes('splash') ? 'splash_potion' : (item?.item?.typeId?.includes('lingering') ? 'lingering_potion' : 'potion')
    if (player.hasTag('class_cleric')) player.getComponent('inventory').container.setItem(item.slot, convertItem)
    else player.runCommand(`replaceitem entity @s slot.${slotType} ${item.slot - (8 * (slotType === 'inventory'))} ${potionType} 1 ${itemData.dataValue}`)
  }
  if (player.hasTag('class_cleric')) player.playSound('ui.enchant', { volume: 0.5, pitch: 1.75 })

}

toAllPlayers(powerful_potions, 15, TicksPerSecond * 15)


/**
 * 
 * List of potion items and their effects
 * 
 * @type { Array<{ typeId: string, dataValue: number, effects: { name: string, duration: number, amplifier: number }[] }> }
 */
export const items = [

  {
    typeId: 'lingering_potion_of_leaping', 
    dataValue: 11,
    effects: [
      { name: 'jump_boost', duration: 180, amplifier: 2 }
    ],
    whenApplied: []
  },
  {
    typeId: 'lingering_potion_of_poison', 
    dataValue: 27,
    effects: [
      { name: 'poison', duration: 45, amplifier: 2 }
    ],
    whenApplied: []
  },
  {
    typeId: 'lingering_potion_of_regeneration', 
    dataValue: 30,
    effects: [
      { name: 'regeneration', duration: 45, amplifier: 2 }
    ],
    whenApplied: []
  },
  {
    typeId: 'lingering_potion_of_slowness', 
    dataValue: 42,
    effects: [
      { name: 'slowness', duration: 40, amplifier: 4 }
    ],
    whenApplied: []
  },
  {
    typeId: 'lingering_potion_of_strength', 
    dataValue: 33,
    effects: [
      { name: 'strength', duration: 180, amplifier: 2 }
    ],
    whenApplied: []
  },
  {
    typeId: 'lingering_potion_of_swiftness', 
    dataValue: 16,
    effects: [
      { name: 'speed', duration: 180, amplifier: 2 }
    ],
    whenApplied: []
  },
  {
    typeId: 'lingering_potion_of_turtle_master', 
    dataValue: 39,
    effects: [
      { name: 'slowness', duration: 40, amplifier: 4 },
      { name: 'resistance', duration: 40, amplifier: 3 },
    ],
    whenApplied: []
  },


  {
    typeId: 'potion_of_harming', 
    dataValue: 24,
    effects: [
      { name: 'instant_damage', duration: 0, amplifier: 2 }
    ],
    whenApplied: []
  },
  {
    typeId: 'potion_of_healing', 
    dataValue: 22,
    effects: [
      { name: 'instant_health', duration: 0, amplifier: 2 }
    ],
    whenApplied: []
  },
  {
    typeId: 'potion_of_leaping', 
    dataValue: 11,
    effects: [
      { name: 'jump_boost', duration: 180, amplifier: 2 }
    ],
    whenApplied: []
  },
  {
    typeId: 'potion_of_poison', 
    dataValue: 27,
    effects: [
      { name: 'poison', duration: 45, amplifier: 2 }
    ],
    whenApplied: []
  },
  {
    typeId: 'potion_of_regeneration', 
    dataValue: 30,
    effects: [
      { name: 'regeneration', duration: 45, amplifier: 2 }
    ],
    whenApplied: []
  },
  {
    typeId: 'potion_of_slowness',
    dataValue: 42,
    effects: [
      { name: 'slowness', duration: 40, amplifier: 3 }
    ],
    whenApplied: []
  },
  {
    typeId: 'potion_of_strength',
    dataValue: 33,
    effects: [
      { name: 'strength', duration: 180, amplifier: 2 }
    ],
    whenApplied: []
  },
  {
    typeId: 'potion_of_swiftness',
    dataValue: 16,
    effects: [
      { name: 'speed', duration: 180, amplifier: 2 }
    ],
    whenApplied: []
  },
  {
    typeId: 'potion_of_turtle_master',
    dataValue: 39,
    effects: [
      { name: 'slowness', duration: 40, amplifier: 4 },
      { name: 'resistance', duration: 40, amplifier: 3 },
    ],
    whenApplied: []
  },


  {
    typeId: 'splash_potion_of_harming',
    dataValue: 24,
    effects: [
      { name: 'instant_damage', duration: 0, amplifier: 2 }
    ],
    whenApplied: []
  },
  {
    typeId: 'splash_potion_of_healing',
    dataValue: 22,
    effects: [
      { name: 'instant_health', duration: 0, amplifier: 2 }
    ],
    whenApplied: []
  },
  {
    typeId: 'splash_potion_of_leaping',
    dataValue: 11,
    effects: [
      { name: 'jump_boost', duration: 180, amplifier: 2 }
    ],
    whenApplied: []
  },
  {
    typeId: 'splash_potion_of_poison',
    dataValue: 27,
    effects: [
      { name: 'poison', duration: 45, amplifier: 2 }
    ],
    whenApplied: []
  },
  {
    typeId: 'splash_potion_of_regeneration',
    dataValue: 30,
    effects: [
      { name: 'regeneration', duration: 45, amplifier: 2 }
    ],
    whenApplied: []
  },
  {
    typeId: 'splash_potion_of_slowness',
    dataValue: 42,
    effects: [
      { name: 'slowness', duration: 40, amplifier: 3 }
    ],
    whenApplied: []
  },
  {
    typeId: 'splash_potion_of_strength',
    dataValue: 33,
    effects: [
      { name: 'strength', duration: 180, amplifier: 2 }
    ],
    whenApplied: []
  },
  {
    typeId: 'splash_potion_of_swiftness',
    dataValue: 16,
    effects: [
      { name: 'speed', duration: 180, amplifier: 2 }
    ],
    whenApplied: []
  },
  {
    typeId: 'splash_potion_of_turtle_master',
    dataValue: 39,
    effects: [
      { name: 'slowness', duration: 40, amplifier: 4 },
      { name: 'resistance', duration: 40, amplifier: 3 },
    ],
    whenApplied: []
  },

]
