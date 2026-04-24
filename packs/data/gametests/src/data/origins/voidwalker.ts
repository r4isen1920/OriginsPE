//voidwalker.ts

interface OriginEffects {
  model?: string
  skin?: string
  emitter?: string
}

interface Origin{
  powers: string[]
  controls?: string[]
  effects?: OriginEffects
}

export const voidwalker: Origin = {
  powers: [
    'beelzebub',
    'soulburst',
    'umbral_veil',
    'life_drain',
    'sinister_aura',
  ],
  effects: {
    emitter: 'voidwalker'
  }
}
