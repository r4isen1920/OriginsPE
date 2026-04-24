//piglin.ts

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

export const piglin: Origin = {
  powers: [
    'pride',
    'increased_attack_per_entity',
    'gluttony',
    'courage',
    'nether_spawn',
    'heavy_pockets'
  ]
}
