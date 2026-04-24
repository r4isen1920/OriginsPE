
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

export const avian: Origin = {
  'powers': [
    'tail_wind',
    'slow_falling',
    'vegetarian',
    'fresh_air',
  ]
}
