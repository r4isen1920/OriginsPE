
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

export const bee: Origin = {
  'powers': [
    'sacrifice_stinger',
    'poisonous',
    'poison_bonus_damage',
    'bloom',
    'nighttime',
    'lifespan',
  ]
}
