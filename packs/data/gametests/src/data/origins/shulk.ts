//shulk.ts

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

export const shulk: Origin = {
  powers: [
    'shulk_inventory',
    'natural_armor',
    'strong_arms',
    'more_exhaustion',
    'no_shield'
  ],
  controls: [
    'shulk_inventory'
  ]
}
