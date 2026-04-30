export interface OriginEffects {
  model?: string
  skin?: string
  emitter?: string
}

export interface Origin {
  powers: string[]
  controls?: string[]
  effects?: OriginEffects
}
