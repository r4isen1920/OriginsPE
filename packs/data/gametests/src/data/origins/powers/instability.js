
import { toAllPlayers } from '../../../origins/player'
import { removeTags } from '../../../utils/tags'

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function instability(player) {
  if (!player.hasTag('power_instability')) return

  const playerEffectsCount = player.getEffects().length
  const currentInstabilityLevel = player.getTags().filter(tag => tag.startsWith('_instability_level_')).map(tag => parseInt(tag.split('_')[2]))[0]
  if (currentInstabilityLevel === playerEffectsCount) return

  const setCurrentLevel = Math.max(21 - playerEffectsCount, 1);
  removeTags(player, '_instability_level_')
  player.addTag(`_instability_level_${setCurrentLevel}`)

  player.triggerEvent(`r4isen1920_originspe:health.${setCurrentLevel * 2}`)

}

toAllPlayers(instability, 20)
