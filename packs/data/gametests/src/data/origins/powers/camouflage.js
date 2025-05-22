import { toAllPlayers } from "../../../origins/player";

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function camouflage(player) {
  const monstersNearby = player.dimension.getEntities({
    location: player.location,
    maxDistance: 6,
	 families: ['mob', 'monster'],
  });

  if (player.hasTag('power_camouflage') && monstersNearby.length === 0) {
    player.triggerEvent('r4isen1920_originspe:family_type.camouflage');
  } else {
    player.triggerEvent('r4isen1920_originspe:family_type.player')
  }
}

toAllPlayers(camouflage, 3);