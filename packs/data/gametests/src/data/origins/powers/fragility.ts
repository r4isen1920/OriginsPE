
import { toAllPlayers } from '../../../origins/player';
import { removeTags } from '../../../utils/tags';
import { Player } from '@minecraft/server';

function fragility(player: Player) {
  if (!player.hasTag('power_fragility')) return;

  const healthComponent = player.getComponent('health');
  if (!healthComponent) return;
  const effectiveMax = healthComponent.effectiveMax || 1;
  const healthPercentage = 50 - Math.floor((healthComponent.currentValue / effectiveMax) * 50);

  removeTags(player, '_dmg_increase_value');
  player.addTag(`_dmg_increase_value_${healthPercentage}`);

}

toAllPlayers(fragility, 20);
