
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

export const diviner: Origin = {
  'powers': [
    'prescience',
    'oracle',
    'aegis',
    'divine_aura',
    'fragility',
    'instability',
  ],
  'controls': [
    'prescience',
  ],
  'effects': {
    'emitter': 'diviner'
  }
}
