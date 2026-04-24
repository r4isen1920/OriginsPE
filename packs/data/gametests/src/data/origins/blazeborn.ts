
interface OriginEffects {
  model?: string
  skin?: string
  emitter?: string
}

interface Origin {
  powers: string[]
  controls?: string[]
  effects?: OriginEffects
}

export const blazeborn: Origin = {
  'powers': [
    'burning_wrath',
    'fire_immunity',
    'hotblooded',
    'nether_spawn',
    'water_vulnerability'
  ]
}
