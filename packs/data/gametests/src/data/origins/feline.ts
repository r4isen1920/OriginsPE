
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

export const feline: Origin = {
  'powers': [
    'fall_immunity',
    'sprint_jump',
    'cat_vision',
    'scare_creepers',
    'nine_lives',
    'weak_arms',
  ]
}
