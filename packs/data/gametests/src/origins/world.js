
import { TicksPerSecond, world } from "@minecraft/server";

import { toAllPlayers } from "./player";


/**
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function getAllPlayerTags(player) {
  return player.getTags()
}

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 */
async function runServerWideAbilities(player) {
  const tags = getAllPlayerTags(player);
  const relevantTags = tags.filter(tag => tag.startsWith('power_') || tag.startsWith('trait_'));

  if (
    relevantTags.length === 0 ||
    relevantTags.some(tag => tag.includes('human')) ||
    relevantTags.some(tag => tag.includes('nitwit'))
  ) return;

  relevantTags.forEach(async tag => {
    const [type, ...rest] = tag.split('_');
    const name = rest.join('_');

    const typeToPath = type === 'power' ? 'origins' : 'classes';
    const typeToFolder = type === 'power' ? 'powers' : 'traits';

    try {
      const module = await import(`../data/${typeToPath}/${typeToFolder}/${name}.js`);
    } catch (e) {

      console.warn(`[r4isen1920][OriginsPE] Failed to load ability ${name}`);
      console.warn(`[r4isen1920][OriginsPE] ${e}`);

    }
  });
}

/**
 * 
 * Run server-wide abilities for
 * all players
 */
toAllPlayers(player => {
  runServerWideAbilities(player)
}, TicksPerSecond * 2)
