
import { TicksPerSecond } from "@minecraft/server";

import { toAllPlayers } from "../../../origins/player";
import { main } from "./longer_potions";

var powerful_potions = (player) => main(player, '_potent', items)
toAllPlayers(powerful_potions, 15, TicksPerSecond * 15)


/**
 * 
 * List of potion items and their effects
 * 
 * @type { Array<{ typeId: string, dataValue: number, effects: { name: string, duration: number, amplifier: number, isNegativeEffect: boolean }[], whenApplied: string[] }> }
 */
export const items = [

  {
    typeId: 'lingering_potion_of_leaping', 
    dataValue: 11,
    effects: [
      { name: 'jump_boost', duration: 180, amplifier: 2, isNegativeEffect: false }
    ],
    whenApplied: []
  },
  {
    typeId: 'lingering_potion_of_poison', 
    dataValue: 27,
    effects: [
      { name: 'poison', duration: 45, amplifier: 2, isNegativeEffect: true }
    ],
    whenApplied: []
  },
  {
    typeId: 'lingering_potion_of_regeneration', 
    dataValue: 30,
    effects: [
      { name: 'regeneration', duration: 45, amplifier: 2, isNegativeEffect: false }
    ],
    whenApplied: []
  },
  {
    typeId: 'lingering_potion_of_slowness', 
    dataValue: 42,
    effects: [
      { name: 'slowness', duration: 40, amplifier: 4, isNegativeEffect: true }
    ],
    whenApplied: [
      '§r§c-75% Speed§r'
    ]
  },
  {
    typeId: 'lingering_potion_of_strength', 
    dataValue: 33,
    effects: [
      { name: 'strength', duration: 180, amplifier: 2, isNegativeEffect: false }
    ],
    whenApplied: []
  },
  {
    typeId: 'lingering_potion_of_swiftness', 
    dataValue: 16,
    effects: [
      { name: 'speed', duration: 180, amplifier: 2, isNegativeEffect: false }
    ],
    whenApplied: [
      '§r§9+60% Speed§r'
    ]
  },
  {
    typeId: 'lingering_potion_of_turtle_master', 
    dataValue: 39,
    effects: [
      { name: 'slowness', duration: 40, amplifier: 4, isNegativeEffect: true },
      { name: 'resistance', duration: 40, amplifier: 3, isNegativeEffect: false },
    ],
    whenApplied: [
      '§r§c-75% Speed§r'
    ]
  },


  {
    typeId: 'potion_of_harming', 
    dataValue: 24,
    effects: [
      { name: 'instant_damage', duration: 0, amplifier: 2, isNegativeEffect: true }
    ],
    whenApplied: []
  },
  {
    typeId: 'potion_of_healing', 
    dataValue: 22,
    effects: [
      { name: 'instant_health', duration: 0, amplifier: 2, isNegativeEffect: false }
    ],
    whenApplied: []
  },
  {
    typeId: 'potion_of_leaping', 
    dataValue: 11,
    effects: [
      { name: 'jump_boost', duration: 180, amplifier: 2, isNegativeEffect: false }
    ],
    whenApplied: []
  },
  {
    typeId: 'potion_of_poison', 
    dataValue: 27,
    effects: [
      { name: 'poison', duration: 45, amplifier: 2, isNegativeEffect: true }
    ],
    whenApplied: []
  },
  {
    typeId: 'potion_of_regeneration', 
    dataValue: 30,
    effects: [
      { name: 'regeneration', duration: 45, amplifier: 2, isNegativeEffect: false }
    ],
    whenApplied: []
  },
  {
    typeId: 'potion_of_slowness',
    dataValue: 42,
    effects: [
      { name: 'slowness', duration: 40, amplifier: 4, isNegativeEffect: true }
    ],
    whenApplied: [
      '§r§c-75% Speed§r'
    ]
  },
  {
    typeId: 'potion_of_strength',
    dataValue: 33,
    effects: [
      { name: 'strength', duration: 180, amplifier: 2, isNegativeEffect: false }
    ],
    whenApplied: []
  },
  {
    typeId: 'potion_of_swiftness',
    dataValue: 16,
    effects: [
      { name: 'speed', duration: 180, amplifier: 2, isNegativeEffect: false }
    ],
    whenApplied: [
      '§r§9+60% Speed§r'
    ]
  },
  {
    typeId: 'potion_of_turtle_master',
    dataValue: 39,
    effects: [
      { name: 'slowness', duration: 40, amplifier: 4, isNegativeEffect: true },
      { name: 'resistance', duration: 40, amplifier: 3, isNegativeEffect: false },
    ],
    whenApplied: [
      '§r§c-75% Speed§r'
    ]
  },


  {
    typeId: 'splash_potion_of_harming',
    dataValue: 24,
    effects: [
      { name: 'instant_damage', duration: 0, amplifier: 2, isNegativeEffect: true }
    ],
    whenApplied: []
  },
  {
    typeId: 'splash_potion_of_healing',
    dataValue: 22,
    effects: [
      { name: 'instant_health', duration: 0, amplifier: 2, isNegativeEffect: false }
    ],
    whenApplied: []
  },
  {
    typeId: 'splash_potion_of_leaping',
    dataValue: 11,
    effects: [
      { name: 'jump_boost', duration: 180, amplifier: 2, isNegativeEffect: false }
    ],
    whenApplied: []
  },
  {
    typeId: 'splash_potion_of_poison',
    dataValue: 27,
    effects: [
      { name: 'poison', duration: 45, amplifier: 2, isNegativeEffect: true }
    ],
    whenApplied: []
  },
  {
    typeId: 'splash_potion_of_regeneration',
    dataValue: 30,
    effects: [
      { name: 'regeneration', duration: 45, amplifier: 2, isNegativeEffect: false }
    ],
    whenApplied: []
  },
  {
    typeId: 'splash_potion_of_slowness',
    dataValue: 42,
    effects: [
      { name: 'slowness', duration: 40, amplifier: 4, isNegativeEffect: true }
    ],
    whenApplied: [
      '§r§c-75% Speed§r'
    ]
  },
  {
    typeId: 'splash_potion_of_strength',
    dataValue: 33,
    effects: [
      { name: 'strength', duration: 180, amplifier: 2, isNegativeEffect: false }
    ],
    whenApplied: []
  },
  {
    typeId: 'splash_potion_of_swiftness',
    dataValue: 16,
    effects: [
      { name: 'speed', duration: 180, amplifier: 2, isNegativeEffect: false }
    ],
    whenApplied: [
      '§r§9+60% Speed§r'
    ]
  },
  {
    typeId: 'splash_potion_of_turtle_master',
    dataValue: 39,
    effects: [
      { name: 'slowness', duration: 40, amplifier: 4, isNegativeEffect: true },
      { name: 'resistance', duration: 40, amplifier: 3, isNegativeEffect: false },
    ],
    whenApplied: [
      '§r§c-75% Speed§r'
    ]
  },

]
