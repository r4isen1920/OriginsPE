
import { EntityDamageCause } from "@minecraft/server";

import { toAllPlayers } from "../../../origins/player";
import { _SCOREBOARD, ResourceBar } from "../../../origins/resource_bar";
import { removeTags } from "../../../utils/tags";

const BAR_LEVELS = [
  0,
  15,
  29,
  43,
  57,
  71,
  85,
  100
]

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function sacrifice_stinger(player) {
  if (!player.hasTag('power_sacrifice_stinger')) return;

  const stingerTags = player.getTags().filter(tag => tag.includes('stinger_level_') && !tag.includes('_was'));
  if (stingerTags.length > 1) removeTags(player, 'stinger_level_');

  if (stingerTags.length > 1 || stingerTags.length === 0) {
    changeStingerLevel(player, 7)
  }

  switch (true) {

    case player.hasTag('stinger_level_7'):
      if (player.hasTag('_was_stinger_level_6') || player.hasTag('_was_stinger_level_0')) {
        onIncrementStingerLevel(player, 7); break
      }

      if (!player.hasTag('_init_bar') && _SCOREBOARD('gui').getScore(player) === 1) {
        new ResourceBar(13, BAR_LEVELS[7], BAR_LEVELS[7], 1, true).push(player);
        player.addTag('_init_bar')
      }

      break

    case player.hasTag('stinger_level_6'):
      if (player.hasTag('_was_stinger_level_7')) {
        onDecrementStingerLevel(player, 6); break
      } else if (player.hasTag('_was_stinger_level_5')) {
        onIncrementStingerLevel(player, 6); break
      }

      if (!player.hasTag('_init_bar') && _SCOREBOARD('gui').getScore(player) === 1) {
        new ResourceBar(13, BAR_LEVELS[6], BAR_LEVELS[6], 1, true).push(player);
        player.addTag('_init_bar')
      }

      break

    case player.hasTag('stinger_level_5'):
      if (player.hasTag('_was_stinger_level_6')) {
        onDecrementStingerLevel(player, 5); break
      } else if (player.hasTag('_was_stinger_level_4')) {
        onIncrementStingerLevel(player, 5); break
      }

      if (!player.hasTag('_init_bar') && _SCOREBOARD('gui').getScore(player) === 1) {
        new ResourceBar(13, BAR_LEVELS[5], BAR_LEVELS[5], 1, true).push(player);
        player.addTag('_init_bar')
      }

      break

    case player.hasTag('stinger_level_4'):
      if (player.hasTag('_was_stinger_level_5')) {
        onDecrementStingerLevel(player, 4); break
      } else if (player.hasTag('_was_stinger_level_3')) {
        onIncrementStingerLevel(player, 4); break
      }

      if (!player.hasTag('_init_bar') && _SCOREBOARD('gui').getScore(player) === 1) {
        new ResourceBar(13, BAR_LEVELS[4], BAR_LEVELS[4], 1, true).push(player);
        player.addTag('_init_bar')
      }

      break

    case player.hasTag('stinger_level_3'):
      if (player.hasTag('_was_stinger_level_4')) {
        onDecrementStingerLevel(player, 3); break
      } else if (player.hasTag('_was_stinger_level_2')) {
        onIncrementStingerLevel(player, 3); break
      }

      if (!player.hasTag('_init_bar') && _SCOREBOARD('gui').getScore(player) === 1) {
        new ResourceBar(13, BAR_LEVELS[3], BAR_LEVELS[3], 1, true).push(player);
        player.addTag('_init_bar')
      }

      break

    case player.hasTag('stinger_level_2'):
      if (player.hasTag('_was_stinger_level_3')) {
        onDecrementStingerLevel(player, 2); break
      } else if (player.hasTag('_was_stinger_level_1')) {
        onIncrementStingerLevel(player, 2); break
      }

      if (!player.hasTag('_init_bar') && _SCOREBOARD('gui').getScore(player) === 1) {
        new ResourceBar(13, BAR_LEVELS[2], BAR_LEVELS[2], 1, true).push(player);
        player.addTag('_init_bar')
      }

      break

    case player.hasTag('stinger_level_1'):
      if (player.hasTag('_was_stinger_level_2')) {
        onDecrementStingerLevel(player, 1); break
      } else if (player.hasTag('_was_stinger_level_0')) {
        onIncrementStingerLevel(player, 1); break
      }

      if (!player.hasTag('_init_bar') && _SCOREBOARD('gui').getScore(player) === 1) {
        new ResourceBar(13, BAR_LEVELS[1], BAR_LEVELS[1], 1, true).push(player);
        player.addTag('_init_bar')
      }

      break

    case player.hasTag('stinger_level_0'):
      if (player.hasTag('_was_stinger_level_1')) {
        onDecrementStingerLevel(player, 0); break
      }

      if (!player.hasTag('_init_bar') && _SCOREBOARD('gui').getScore(player) === 1) {
        new ResourceBar(13, BAR_LEVELS[0], BAR_LEVELS[0], 1, true).push(player);
        player.addTag('_init_bar')
      }

      break

  }

}

toAllPlayers(sacrifice_stinger, 3)

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 * @param { string | number } level 
 */
export function changeStingerLevel(player, level) {
  const levelClamped = Math.clamp(level, 0, 7)
  const removedTags = removeTags(player, 'stinger_level')
  player.addTag(`stinger_level_${levelClamped}`)
  if (removedTags.length > 0) player.addTag(`_was_${removedTags[0]}`)
}

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 * @param { string | number } level 
 */
function onIncrementStingerLevel(player, level) {

  removeTags(player, '_was_stinger_level');

  player.getComponent('health').resetToMaxValue();

  new ResourceBar(13, BAR_LEVELS[level - 1], BAR_LEVELS[level], 1, true)
      .push(player)

}

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 * @param { string | number } level 
 */
function onDecrementStingerLevel(player, level) {

  removeTags(player, '_was_stinger_level');

  switch (level) {

    default:
      player.getComponent('health').resetToMaxValue();
      break

    case '0':
      player.applyDamage(9999, { cause: EntityDamageCause.magic })
      changeStingerLevel(player, 1)
      break

  }

  new ResourceBar(13, BAR_LEVELS[level + 1], BAR_LEVELS[level], 1, true)
      .push(player)

}
