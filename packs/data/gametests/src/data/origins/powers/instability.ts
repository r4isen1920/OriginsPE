import { Player } from '@minecraft/server';

import { toAllPlayers } from '../../../origins/player';
import { removeTags } from '../../../utils/tags';


function instability(player: Player) {
  if (!player.hasTag('power_instability')) return;

  const playerEffectsCount = player.getEffects().filter(effect => effect.typeId !== 'health_boost').length;
  const currentInstabilityLevel = player.getTags().filter(tag => tag.startsWith('_instability_level_')).map(tag => parseInt(tag.split('_')[2]))[0];
  if (currentInstabilityLevel === playerEffectsCount) return;

  const setCurrentLevel = Math.max(20 - (playerEffectsCount * 2), 2);
  removeTags(player, '_instability_level_');
  player.addTag(`_instability_level_${setCurrentLevel}`);

  player.triggerEvent(`r4isen1920_originspe:health.${Math.min(setCurrentLevel, 20)}`);

}

toAllPlayers(instability, 20);
