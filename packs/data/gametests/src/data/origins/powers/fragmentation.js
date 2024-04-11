
import { toAllPlayers } from "../../../origins/player";
import { _SCOREBOARD, ResourceBar } from "../../../origins/resource_bar";
import { removeTags } from "../../../utils/tags";

const BAR_FULL = 100;
const BAR_TWO_THIRDS = 71;
const BAR_ONE_THIRD = 29;

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function fragmentation(player) {
  if (!player.hasTag('power_fragmentation')) return;


  const playerHealth = player.getComponent('health').currentValue

  switch (true) {

    // If player has no fragementation level tag, add the highest level by default
    case !player.getTags().some(tag => tag.includes('fragmentation_level_')):
      changeFragementationLevel(player, 3)
      break

    // TODO: when regenerating HP, do not trigger this
    case (player.hasTag('fragmentation_level_3') && playerHealth < 20):
      changeFragementationLevel(player, 2);
      break
    case (player.hasTag('fragmentation_level_2') && playerHealth < 10):
      changeFragementationLevel(player, 1);
      break


    case player.hasTag('fragmentation_level_3'):
      player.triggerEvent('r4isen1920_originspe:health.40');
      player.triggerEvent('r4isen1920_originspe:scale.1.25');

      if (player.hasTag('_was_fragmentation_level_2')) {
        onIncrementFragmentationLevel(player, 3); break
      }

      if (!player.hasTag('_init_fragmentation') && _SCOREBOARD('gui').getScore(player) === 1) {
        new ResourceBar(8, BAR_FULL, BAR_FULL, 1, true).push(player);
        player.addTag('_init_fragmentation')
      }

      break

    case player.hasTag('fragmentation_level_2'):
      player.triggerEvent('r4isen1920_originspe:health.20');
      player.triggerEvent('r4isen1920_originspe:scale.1');

      if (player.hasTag('_was_fragmentation_level_3')) {
        onDecrementFragmentationLevel(player, 2); break
      } else if (player.hasTag('_was_fragmentation_level_1')) {
        onIncrementFragmentationLevel(player, 2); break
      }

      if (!player.hasTag('_init_fragmentation') && _SCOREBOARD('gui').getScore(player) === 1) {
        new ResourceBar(8, BAR_TWO_THIRDS, BAR_TWO_THIRDS, 1, true).push(player);
        player.addTag('_init_fragmentation')
      }

      break

    case player.hasTag('fragmentation_level_1'):
      player.triggerEvent('r4isen1920_originspe:health.10');
      player.triggerEvent('r4isen1920_originspe:scale.0.5');

      if (player.hasTag('_was_fragmentation_level_2')) {
        onDecrementFragmentationLevel(player, 1); break
      }

      if (!player.hasTag('_init_fragmentation') && _SCOREBOARD('gui').getScore(player) === 1) {
        new ResourceBar(8, BAR_ONE_THIRD, BAR_ONE_THIRD, 1, true).push(player);
        player.addTag('_init_fragmentation')
      }

      break

  }

}

toAllPlayers(fragmentation, 3)

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 * @param { number } level 
 */
export function changeFragementationLevel(player, level) {
  const removedTags = removeTags(player, 'fragmentation_level')
  player.addTag(`fragmentation_level_${level}`)
  if (removedTags.length > 0) player.addTag(`_was_${removedTags[0]}`)
}

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 * @param { number } level 
 */
function onIncrementFragmentationLevel(player, level) {

  removeTags(player, '_was_fragmentation_level');

  player.getComponent('health').resetToMaxValue();

  switch (level) {
    case 2:
      new ResourceBar(8, BAR_ONE_THIRD, BAR_TWO_THIRDS, 1, true)
          .push(player)
      break;

    case 3:
      new ResourceBar(8, BAR_TWO_THIRDS, BAR_FULL, 1, true)
          .push(player)
      break
  }

}

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 * @param { number } level 
 */
function onDecrementFragmentationLevel(player, level) {

  removeTags(player, '_was_fragmentation_level');

  player.getComponent('health').resetToMaxValue();

  switch (level) {
    case 1:
      new ResourceBar(8, BAR_TWO_THIRDS, BAR_ONE_THIRD, 1, true)
          .push(player)
      break;

    case 2:
      new ResourceBar(8, BAR_FULL, BAR_TWO_THIRDS, 1, true)
          .push(player)
      break
  }

}
