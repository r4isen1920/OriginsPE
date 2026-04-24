
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

export const kitsune: Origin = {
  powers: [
    'pounce',
    'camouflage',
    'fast_footed',
    'berry_craver',
    'fall_immunity',
    'smaller_heart',
    'more_exhaustion'
  ],
  controls: [
    'pounce-hold'
  ]
}
