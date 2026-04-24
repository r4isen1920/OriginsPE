
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

export const enderian: Origin = {
  'powers': [
    'throw_ender_pearl',
    'familiar_face',
    'water_vulnerability',
    'pumpkin_hate'
  ],
  'controls': [
    'throw_ender_pearl'
  ],
  'effects': {
    'emitter': 'enderian'
  }
}
