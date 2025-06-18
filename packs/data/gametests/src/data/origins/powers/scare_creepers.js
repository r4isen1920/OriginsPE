import { toAllPlayers } from "../../../origins/player";


/**
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function scare_creepers(player) {
  if (!player.hasTag('power_scare_creepers')) return;

  // Get nearby entities within 16 blocks radius
  const nearbyEntities = player.dimension.getEntities({
    location: player.location,
    maxDistance: 16,
    type: "minecraft:creeper"
  });

  // For each nearby creeper
  for (const creeper of nearbyEntities) {
    // Force stop swelling and make creeper run away
    creeper.triggerEvent('minecraft:stop_exploding');
    creeper.triggerEvent('minecraft:start_panicking_event');
    creeper.clearVelocity();
    
    // Calculate direction away from player
    const dx = creeper.location.x - player.location.x;
    const dz = creeper.location.z - player.location.z;
    const distance = Math.sqrt(dx * dx + dz * dz);
    
    // Apply stronger escape velocity
    if (distance < 10) {
      creeper.applyImpulse({
        x: (dx / distance) * 0.8,
        y: 0.2,
        z: (dz / distance) * 0.8
      });
    }

    // Add a tag to mark this creeper as scared
    creeper.addTag('scared_by_cat');
  }

  // Update player's cat family type
  player.triggerEvent('r4isen1920_originspe:family_type.cat');
}

toAllPlayers(scare_creepers, 3);