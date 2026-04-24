//merling.ts

interface OriginEffects{
  model?: string
  skin?: string
  emitter?: string
}

interface Origin{
  powers: string[]
  controls?: string[]
  effects?: OriginEffects
}

export const merling: Origin = {
  powers: [
    'land_breathing_grace',
    'water_breathing',
    'aqua_affinity',
    'sea_creature',
    'like_water',
    'no_trident_damage',
    'fluid_motion',
    'water_bottle_increase_bubble',
  ]
}
