//phantom.ts

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

export const phantom: Origin  = {
  powers: [
    'phantomize',
    'spiritual_body',
    'more_exhaustion',
    'burns_in_daylight',
    'undead',
  ],
  controls: [
    'phantomize'
  ],
  effects: {
    'skin': 'ghostly'
  }
}
