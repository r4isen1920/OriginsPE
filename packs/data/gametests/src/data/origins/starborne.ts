//starborne

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

export const starborne: Origin = {
  powers: [
    'stress_and_meditate',
    'hyper_leap',
    'shooting_star',
    'cosmic_gift',
    'no_hitting',
    'cold_vacuum',
  ],
  controls: [
    'hyper_leap',
    'shooting_star',
  ],
  effects: {
    'emitter': 'starborne'
  }
}
