
import { toAllPlayers } from '../../../origins/player'
import { removeTags } from '../../../utils/tags'

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function fragility(player) {
  if (!player.hasTag('power_fragility')) return

  /**
   * @type { import('@minecraft/server').EntityHealthComponent }
   */
  const healthComponent = player.getComponent('health')
  const healthPercentage = 50 - Math.floor((healthComponent.currentValue / healthComponent.effectiveMax) * 50)

  removeTags(player, '_dmg_increase_value');
  player.addTag(`_dmg_increase_value_${healthPercentage}`)

}

toAllPlayers(fragility, 20)
