
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

export const arachnid: Origin = {
  'powers': [
    'webbing',
    'master_of_webs',
    'climbing',
    'carnivore',
    'fragile',
  ]
}
