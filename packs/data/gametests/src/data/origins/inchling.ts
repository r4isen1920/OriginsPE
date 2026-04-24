
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

export const inchling: Origin = {
  'powers': [
    'hyper_active',
    'nimble',
    'bite_sized',
    'small_apetite',
  ],
  'effects': {
    'model': 'tiny'
  }
}
