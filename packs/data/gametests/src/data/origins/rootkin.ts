//rootkin.ts

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

export const rootkin: Origin = {
  powers: [
      'wrathbloom',
      'vine_bind',
      'cold_vacuum', // Re-use Starborne power--take twice fire damage
      'barehanded'
  ],
  controls: []
}
