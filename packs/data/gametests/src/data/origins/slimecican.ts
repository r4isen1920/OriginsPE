//slimecican.ts

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

export const slimecican: Origin = {
  powers: [
    'high_jump',
    'fragmentation',
    'slime_ball_consume',
    'bouncy_body',
    'sticky',
  ],
  effects: {
    'skin': 'slimy'
  }
}
