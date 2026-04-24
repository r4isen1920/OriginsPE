
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

export const human: Origin = {
  'powers': [],
  'controls': [],
  'effects': {
    'model': 'normal',
    'skin': 'normal',
    'emitter': 'none'
  }
}
