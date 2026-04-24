
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

export const elytrian: Origin = {
  powers: [
    'launch_into_air',
    'elytra',
    'aerial_combatant',
    'light_armor',
    'claustrophobia',
    'more_kinetic_damage',
  ],
  controls: [
    'launch_into_air'
  ]
}
