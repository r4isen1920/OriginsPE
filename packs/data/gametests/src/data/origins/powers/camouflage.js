import { toAllPlayers } from "../../../origins/player";

/**
 * Calculates the Euclidean distance between two Vector3 objects.
 * @param { import('@minecraft/server').Vector3 } a 
 * @param { import('@minecraft/server').Vector3 } b 
 * @returns { number }
 */
function getDistance(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function camouflage(player) {
  const allMobs = player.dimension.getEntities({
    families: ["mob"]
  });

  const isFarFromMobs = allMobs.every(
    mob => getDistance(mob.location, player.location) > 5
  );

  if (player.hasTag('power_camouflage') && player.isSneaking && isFarFromMobs) {
    player.triggerEvent('r4isen1920_originspe:family_type.camouflage');
  } else {
    player.triggerEvent('r4isen1920_originspe:family_type.player');
  }
}

toAllPlayers(camouflage, 3);