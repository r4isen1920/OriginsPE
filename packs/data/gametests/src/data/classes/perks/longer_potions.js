
import { ItemStack, world, system, TicksPerSecond } from "@minecraft/server";

import { toAllPlayers } from "../../../origins/player";
import { findItems } from "../../../utils/items";
import * as powerful_potions from "./powerful_potions";

export const potency = [
  'I',
  'II',
  'III',
  'IV',
  'V',
  'VI',
  'VII',
  'VIII',
  'IX',
  'X'
]

/**
 * 
 * Main runtime for this perk
 * 
 * @param { import('@minecraft/server').Player } player 
 * @param { '_long' | '_potent' } potion_filter 
 * @param { Array<{ typeId: string, dataValue: number, effects: { name: string, duration: number, amplifier: number, isNegativeEffect: boolean }[], whenApplied: string[] }> } itemList 
 */
export function main(player, potion_filter, itemList) {
  const potionItemsInInventory = findItems(player).filter(item => items.some(i => (item?.item?.typeId?.includes(`temp_${i.typeId}`) && item?.item?.typeId?.includes(potion_filter))))
  if (potionItemsInInventory.length === 0) return;

  for (const item of potionItemsInInventory) {
    const convertItem = new ItemStack(item.item.typeId.replace('r4isen1920_originspe:temp_', 'r4isen1920_originspe:cleric_'), item.item.amount)

    const itemData = itemList.find(i => item.item.typeId.includes(i.typeId))
    let setLore = []
    itemData.effects.forEach(effect => {
      const effectName = (effect.isNegativeEffect ? '§c' : '§7') + effect.name.replace(/.+_of_|_/gm, ' ').toTitle()
      const amplifier = potency[effect.amplifier] || effect.amplifier
      const duration = Math.floor(effect.duration / 60) + ':' + ((effect.duration % 60).toString().padStart(2, '0'))

      if (effect.amplifier === 0) setLore.push(`§r${effectName} (${duration})`);
      else if (effect.duration === 0) setLore.push(`§r${effectName} ${amplifier}`);
      else setLore.push(`§r${effectName} ${amplifier} (${duration})`);
    })
    if (itemData.whenApplied.length > 0) setLore.push('§r§7', '§r§5When Applied:', ...itemData.whenApplied)
    setLore.push('§r§7', '§r§6Enhanced Potion§r')
    convertItem.setLore(setLore)

    const slotType = item.slot <= 8 ? 'hotbar' : 'inventory'
    const potionType = item?.item?.typeId?.includes('splash') ? 'splash_potion' : (item?.item?.typeId?.includes('lingering') ? 'lingering_potion' : 'potion')
    if (player.hasTag('class_cleric')) player.getComponent('inventory').container.setItem(item.slot, convertItem)
    else player.runCommand(`replaceitem entity @s slot.${slotType} ${item.slot - (8 * (slotType === 'inventory'))} ${potionType} 1 ${itemData.dataValue}`)
  }
  if (player.hasTag('class_cleric')) player.playSound('ui.enchant', { volume: 0.5, pitch: 1.75 })

}

var longer_potions = (player) => main(player, '_long', items)
toAllPlayers(longer_potions, 15, TicksPerSecond * 15)


/**
 * 
 * Run the effects of longer
 * and better potions
 */
system.runTimeout(() => {

  world.afterEvents.itemCompleteUse.subscribe(
    event => {

      const { itemStack, source } = event;
      if (!itemStack.getLore().includes('§r§6Enhanced Potion§r')) return

      const itemList = itemStack.typeId.includes('_long') ? items : powerful_potions.items
      const itemData = itemList.find(i => itemStack.typeId.includes(i.typeId))
      if (!itemData) return

      itemData.effects.forEach(effect => {
        source.addEffect(effect.name, Math.max(TicksPerSecond * effect.duration, 1), { amplifier: effect.amplifier, showParticles: true })
      })

    }
  )

}, TicksPerSecond * 15)


/**
 * 
 * List of potion items and their effects
 * 
 * @type { Array<{ typeId: string, dataValue: number, effects: { name: string, duration: number, amplifier: number, isNegativeEffect: boolean }[], whenApplied: string[] }> }
 */
const items = [

  {
    typeId: 'lingering_potion_of_fire_resistance',
    dataValue: 13,
    effects: [
      { name: 'fire_resistance', duration: 960, amplifier: 0, isNegativeEffect: false }
    ],
    whenApplied: []
  },
  {
    typeId: 'lingering_potion_of_invisibility',
    dataValue: 8,
    effects: [
      { name: 'invisibility', duration: 960, amplifier: 0, isNegativeEffect: false }
    ],
    whenApplied: []
  },
  {
    typeId: 'lingering_potion_of_leaping',
    dataValue: 10,
    effects: [
      { name: 'jump_boost', duration: 960, amplifier: 0, isNegativeEffect: false }
    ],
    whenApplied: []
  },
  {
    typeId: 'lingering_potion_of_night_vision',
    dataValue: 6,
    effects: [
      { name: 'night_vision', duration: 960, amplifier: 0, isNegativeEffect: false }
    ],
    whenApplied: []
  },
  {
    typeId: 'lingering_potion_of_poison',
    dataValue: 26,
    effects: [
      { name: 'poison', duration: 180, amplifier: 0, isNegativeEffect: true }
    ],
    whenApplied: []
  },
  {
    typeId: 'lingering_potion_of_regeneration',
    dataValue: 29,
    effects: [
      { name: 'regeneration', duration: 240, amplifier: 0, isNegativeEffect: false }
    ],
    whenApplied: []
  },
  {
    typeId: 'lingering_potion_of_slow_falling',
    dataValue: 41,
    effects: [
      { name: 'slow_falling', duration: 180, amplifier: 0, isNegativeEffect: false }
    ],
    whenApplied: []
  },
  {
    typeId: 'lingering_potion_of_slowness',
    dataValue: 18,
    effects: [
      { name: 'slowness', duration: 480, amplifier: 0, isNegativeEffect: true }
    ],
    whenApplied: [
      '§r§c-15% Speed§r'
    ]
  },
  {
    typeId: 'lingering_potion_of_strength',
    dataValue: 32,
    effects: [
      { name: 'strength', duration: 960, amplifier: 0, isNegativeEffect: false }
    ],
    whenApplied: []
  },
  {
    typeId: 'lingering_potion_of_swiftness',
    dataValue: 15,
    effects: [
      { name: 'speed', duration: 960, amplifier: 0, isNegativeEffect: false }
    ],
    whenApplied: [
      '§r§9+20% Speed§r'
    ]
  },
  {
    typeId: 'lingering_potion_of_turtle_master',
    dataValue: 38,
    effects: [
      { name: 'slowness', duration: 80, amplifier: 3, isNegativeEffect: true },
      { name: 'resistance', duration: 80, amplifier: 2, isNegativeEffect: false },
    ],
    whenApplied: [
      '§r§c-60% Speed§r'
    ]
  },
  {
    typeId: 'lingering_potion_of_water_breathing',
    dataValue: 20,
    effects: [
      { name: 'water_breathing', duration: 960, amplifier: 0, isNegativeEffect: false }
    ],
    whenApplied: []
  },
  {
    typeId: 'lingering_potion_of_weakness',
    dataValue: 35,
    effects: [
      { name: 'weakness', duration: 480, amplifier: 0, isNegativeEffect: false }
    ],
    whenApplied: [
      '§r§c-0.7 Attack Damage§r'
    ]
  },


  {
    typeId: 'potion_of_fire_resistance',
    dataValue: 13,
    effects: [
      { name: 'fire_resistance', duration: 960, amplifier: 0, isNegativeEffect: false }
    ],
    whenApplied: []
  },
  {
    typeId: 'potion_of_invisibility',
    dataValue: 8,
    effects: [
      { name: 'invisibility', duration: 960, amplifier: 0, isNegativeEffect: false }
    ],
    whenApplied: []
  },
  {
    typeId: 'potion_of_leaping',
    dataValue: 10,
    effects: [
      { name: 'jump_boost', duration: 960, amplifier: 0, isNegativeEffect: false }
    ],
    whenApplied: []
  },
  {
    typeId: 'potion_of_night_vision',
    dataValue: 6,
    effects: [
      { name: 'night_vision', duration: 960, amplifier: 0, isNegativeEffect: false }
    ],
    whenApplied: []
  },
  {
    typeId: 'potion_of_poison',
    dataValue: 26,
    effects: [
      { name: 'poison', duration: 180, amplifier: 0, isNegativeEffect: true }
    ],
    whenApplied: []
  },
  {
    typeId: 'potion_of_regeneration',
    dataValue: 29,
    effects: [
      { name: 'regeneration', duration: 240, amplifier: 0, isNegativeEffect: false }
    ],
    whenApplied: []
  },
  {
    typeId: 'potion_of_slow_falling',
    dataValue: 41,
    effects: [
      { name: 'slow_falling', duration: 180, amplifier: 0, isNegativeEffect: false }
    ],
    whenApplied: []
  },
  {
    typeId: 'potion_of_slowness',
    dataValue: 18,
    effects: [
      { name: 'slowness', duration: 480, amplifier: 0, isNegativeEffect: true }
    ],
    whenApplied: [
      '§r§c-15% Speed§r'
    ]
  },
  {
    typeId: 'potion_of_strength',
    dataValue: 32,
    effects: [
      { name: 'strength', duration: 960, amplifier: 0, isNegativeEffect: false }
    ],
    whenApplied: []
  },
  {
    typeId: 'potion_of_swiftness',
    dataValue: 15,
    effects: [
      { name: 'speed', duration: 960, amplifier: 0, isNegativeEffect: false }
    ],
    whenApplied: [
      '§r§9+20% Speed§r'
    ]
  },
  {
    typeId: 'potion_of_turtle_master',
    dataValue: 38,
    effects: [
      { name: 'slowness', duration: 80, amplifier: 3, isNegativeEffect: true },
      { name: 'resistance', duration: 80, amplifier: 2, isNegativeEffect: false },
    ],
    whenApplied: [
      '§r§c-60% Speed§r'
    ]
  },
  {
    typeId: 'potion_of_water_breathing',
    dataValue: 20,
    effects: [
      { name: 'water_breathing', duration: 960, amplifier: 0, isNegativeEffect: false }
    ],
    whenApplied: []
  },
  {
    typeId: 'potion_of_weakness',
    dataValue: 35,
    effects: [
      { name: 'weakness', duration: 480, amplifier: 0, isNegativeEffect: true }
    ],
    whenApplied: [
      '§r§c-0.7 Attack Damage§r'
    ]
  },


  {
    typeId: 'splash_potion_of_fire_resistance',
    dataValue: 13,
    effects: [
      { name: 'fire_resistance', duration: 960, amplifier: 0, isNegativeEffect: false }
    ],
    whenApplied: []
  },
  {
    typeId: 'splash_potion_of_invisibility',
    dataValue: 8,
    effects: [
      { name: 'invisibility', duration: 960, amplifier: 0, isNegativeEffect: false }
    ],
    whenApplied: []
  },
  {
    typeId: 'splash_potion_of_leaping',
    dataValue: 10,
    effects: [
      { name: 'jump_boost', duration: 960, amplifier: 0, isNegativeEffect: false }
    ],
    whenApplied: []
  },
  {
    typeId: 'splash_potion_of_night_vision',
    dataValue: 6,
    effects: [
      { name: 'night_vision', duration: 960, amplifier: 0, isNegativeEffect: false }
    ],
    whenApplied: []
  },
  {
    typeId: 'splash_potion_of_poison',
    dataValue: 26,
    effects: [
      { name: 'poison', duration: 180, amplifier: 0, isNegativeEffect: true }
    ],
    whenApplied: []
  },
  {
    typeId: 'splash_potion_of_regeneration',
    dataValue: 29,
    effects: [
      { name: 'regeneration', duration: 240, amplifier: 0, isNegativeEffect: false }
    ],
    whenApplied: []
  },
  {
    typeId: 'splash_potion_of_slow_falling',
    dataValue: 41,
    effects: [
      { name: 'slow_falling', duration: 180, amplifier: 0, isNegativeEffect: false }
    ],
    whenApplied: []
  },
  {
    typeId: 'splash_potion_of_slowness',
    dataValue: 18,
    effects: [
      { name: 'slowness', duration: 480, amplifier: 0, isNegativeEffect: true }
    ],
    whenApplied: [
      '§r§c-15% Speed§r'
    ]
  },
  {
    typeId: 'splash_potion_of_strength',
    dataValue: 32,
    effects: [
      { name: 'strength', duration: 960, amplifier: 0, isNegativeEffect: false }
    ],
    whenApplied: []
  },
  {
    typeId: 'splash_potion_of_swiftness',
    dataValue: 15,
    effects: [
      { name: 'speed', duration: 960, amplifier: 0, isNegativeEffect: false }
    ],
    whenApplied: [
      '§r§9+20% Speed§r'
    ]
  },
  {
    typeId: 'splash_potion_of_turtle_master',
    dataValue: 38,
    effects: [
      { name: 'slowness', duration: 80, amplifier: 3, isNegativeEffect: true },
      { name: 'resistance', duration: 80, amplifier: 2, isNegativeEffect: false },
    ],
    whenApplied: [
      '§r§c-60% Speed§r'
    ]
  },
  {
    typeId: 'splash_potion_of_water_breathing',
    dataValue: 20,
    effects: [
      { name: 'water_breathing', duration: 960, amplifier: 0, isNegativeEffect: false }
    ],
    whenApplied: []
  },
  {
    typeId: 'splash_potion_of_weakness',
    dataValue: 35,
    effects: [
      { name: 'weakness', duration: 480, amplifier: 0, isNegativeEffect: true }
    ],
    whenApplied: [
      '§r§c-0.7 Attack Damage§r'
    ]
  },

]
