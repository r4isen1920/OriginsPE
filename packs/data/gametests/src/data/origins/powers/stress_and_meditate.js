
import { toAllPlayers } from '../../../origins/player';
import { ResourceBar } from '../../../origins/resource_bar';
import { Vector3 } from '../../../utils/Vec3';

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function stress_and_meditate(player) {
  if (!player.hasTag('power_stress_and_meditate')) return;

  // Ignore if the player is dead
  if (player.getComponent('health').currentValue <= 0) return;

  const stressProperty = 'r4isen1920_originspe:stress';
  const currentStressValue = player.getDynamicProperty(stressProperty) || 0;
  if (!currentStressValue) player.setDynamicProperty(stressProperty, 0);

  const newStressValue = currentStressValue + (player.isSneaking ? -0.05 : 0.05);
  player.setDynamicProperty(stressProperty, newStressValue);

  const hasAnyCooldown = player.getTags().filter(tag => tag.includes('cooldown_')).length > 0;
  if (!hasAnyCooldown) new ResourceBar(9, Math.round(newStressValue), Math.round(newStressValue), 1, true).push(player);

  if (newStressValue >= 100.0) {
    player.setDynamicProperty(stressProperty, 0);
    
    player.dimension.spawnEntity('r4isen1920_originspe:huge_explosion', player.location);
    player.dimension.spawnParticle('r4isen1920_originspe:star_supernova', Vector3.add(player.location, new Vector3(0, 1, 0)));

  }

}

toAllPlayers(stress_and_meditate, 3)
