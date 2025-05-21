
import { toAllPlayers } from "../../../origins/player";

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function camouflage(player) {
  const mobsNearby = player.dimension.getEntities({
    location: player.location,
    maxDistance: 5,
    families: ["mob"]
  })
  if (player.hasTag('power_camouflage') && player.isSneaking && mobsNearby.length > 0) {
    player.triggerEvent('r4isen1920_originspe:family_type.camouflage')

  } else {
    
    player.triggerEvent('r4isen1920_originspe:family_type.player')
    
  }
}

toAllPlayers(camouflage, 3)
