import { TicksPerSecond, Player } from "@minecraft/server";

import { toAllPlayers } from "./player";


/**
 * 
 * @param player 
 */
async function runServerWideAbilities(player: Player): Promise<void> {
  const tags = player.getTags();
  const relevantTags = tags.filter(tag => tag.startsWith('power_') || tag.startsWith('perk_'));

  if (
    relevantTags.length === 0 ||
    relevantTags.some(tag => tag.includes('human')) ||
    relevantTags.some(tag => tag.includes('nitwit'))
  ) return;

  for (const tag of relevantTags) {
    const [type, ...rest] = tag.split('_');
    const name = rest.join('_');

    const typeToPath = type === 'power' ? 'origins' : 'classes';
    const typeToFolder = type === 'power' ? 'powers' : 'perks';

    try {
      await import(`../data/${typeToPath}/${typeToFolder}/${name}.js`);
    } catch (e) {
      console.warn(`[r4isen1920][OriginsPE] Failed to load ${type}: '${name}' for ${player.name}`);
      console.warn(`[r4isen1920][OriginsPE] ${e}`);
    }
  }
}

/**
 * 
 * Run server-wide abilities for
 * all players
 */
toAllPlayers(player => {
  runServerWideAbilities(player)
}, TicksPerSecond * 2)
