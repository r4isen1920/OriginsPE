//mole.ts

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

export const mole: Origin = {
  powers: [
	 "vegetarian",
    "claustrophile",
    "burrow_sense",
    "claw_digging",
    "darkvision",
    "photosensitive",
    "heavy_bones",
    "minimole",
    "tunnel_leap"
  ],
  controls: [
    "burrow_sense",
    "tunnel_leap"
  ],
  effects: {
    'model': 'small'
  }
}