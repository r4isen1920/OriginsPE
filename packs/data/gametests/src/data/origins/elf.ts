// elf.ts

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

export const elf: Origin = {
  powers: [
    'lifeweaver',
    'endless_quiver',
    'imbue',
    'swift',
    'permeable',
  ],
  effects: {
    emitter: 'elven'
  }
}