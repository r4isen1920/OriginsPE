
import { TicksPerSecond, world } from '@minecraft/server';

import { toAllPlayers } from './player';
import { zFill } from '../utils/string';
import { removeTags } from '../utils/tags';


/**
 * 
 * Returns the scoreboard
 * for the specified resource bar
 * 
 * @param { string | number } id 
 * @param { 'id' | 'from' | 'to' | 'duration' } type 
 * @returns { import('@minecraft/server').ScoreboardObjective }
 */
const _SCOREBOARD = function(id, type) {
  return world.scoreboard.getObjective(`resource_bar${id}${type}`) || world.scoreboard.addObjective(`resource_bar${id}${type}`, `resource_bar${id}${type}`)
}

/**
 * 
 * Handles the resource bar or
 * cooldown renderer for the Origins
 * abilities
 */
export class ResourceBar {
  /**
   * 
   * Creates a new instance of
   * resource bar
   * 
   * @param { number } id 
   * The numerical ID of the cooldown bar from `textures/origins/hud/cooldown/`
   * @param { number } from 
   * The start value of the cooldown from 1 to 100 percent
   * @param { number } to 
   * The end value of the cooldown from 1 to 100 percent
   * @param { number } duration 
   * The duration of the cooldown in seconds
   * @param { boolean } persist 
   * Whether to remove the cooldown bar or not when the duration ends
   */
  constructor(id=1, from=0, to=100, duration=1, persist=false) {
    this.id = id;
    this.from = from;
    this.to = to;
    this.duration = duration;
    this.persist = persist;
  }

  /**
   * 
   * Appends the resource bar to the
   * cooldown list
   * 
   * @param { import('@minecraft/server').Player } player 
   * The player to send the cooldown to
   * @param { boolean } flush 
   * Whether to flush the cooldown bar or not
   * 
   * @returns { ResourceBar }
   */
  push(player, flush=true) {
    let scoreboardUpdated = false;
    for (let i = 1; i <= 3 && !scoreboardUpdated; i++) {
      if (_SCOREBOARD(i, 'id').getScore(player) === 0) {
        _SCOREBOARD(i, 'id').setScore(player, this.id);
        _SCOREBOARD(i, 'from').setScore(player, this.from);
        _SCOREBOARD(i, 'to').setScore(player, this.to);
        _SCOREBOARD(i, 'duration').setScore(player, this.duration);
        scoreboardUpdated = true;
      }
    }

    if (!this.persist) player.addTag(`cooldown_${this.id}`);
    if (flush) renderBars(player);

    return this;
  }

  /**
   * 
   * Updates existing resource bar
   * matching the provided id from
   * the cooldown list
   * 
   * @param { import('@minecraft/server').Player } player 
   * The player to send the cooldown to
   * @param { boolean } persist 
   * Whether to remove the cooldown bar or not
   * @param { number } from 
   * The start value of the cooldown from 1 to 100 percent
   * @param { number } to 
   * The end value of the cooldown from 1 to 100 percent
   * @param { number } duration 
   * The duration of the cooldown in seconds
   * 
   * @returns { ResourceBar }
   */
  update(player, persist=this.persist, from=this.from, to=this.to, duration=this.duration) {
    let isSameValue = false;
    let scoreboardId;

    for (let i = 1; i <= 3; i++) {
      if (_SCOREBOARD(i, 'id').getScore(player) === this.id) {
        scoreboardId = i;
        break;
      }
    }

    if (!scoreboardId) return this.push(player, persist);

    if (
      _SCOREBOARD(scoreboardId, 'id').getScore(player) === this.id &&
      _SCOREBOARD(scoreboardId, 'from').getScore(player) === from &&
      _SCOREBOARD(scoreboardId, 'to').getScore(player) === to
    ) isSameValue = true;

    _SCOREBOARD(scoreboardId, 'id').setScore(player, this.id);
    _SCOREBOARD(scoreboardId, 'from').setScore(player, from);
    _SCOREBOARD(scoreboardId, 'to').setScore(player, to);
    _SCOREBOARD(scoreboardId, 'duration').setScore(player, duration);

    if (!persist) player.addTag(`cooldown_${this.id}`);
    else player.removeTag(`cooldown_${this.id}`);

    if (!isSameValue) renderBars(player);

    return this
  }

  /**
   * 
   * Immediately ends the existing 
   * resource bar from the player
   * 
   * @param { import('@minecraft/server').Player } player 
   * The player to send the cooldown to
   * @param { number } id 
   * The ID of the cooldown bar to remove
   * 
   * @returns { ResourceBar }
   */
  pop(player, id=this.id) {
    for (let i = 1; i <= 3; i++) {
      if (_SCOREBOARD(i, 'id').getScore(player) === id) {
        _SCOREBOARD(i, 'duration').setScore(player, 0);
        break;
      }
    }

    return this
  }

  /**
   * 
   * Clears the resource bar
   * and any concurrent cooldown
   * from the player
   * 
   * @param { import('@minecraft/server').Player } player 
   * The player to send the cooldown to
   * 
   * @returns { ResourceBar }
   */
  clear(player) {
    for (let i = 1; i <= 3; i++) {
      _SCOREBOARD(i, 'id').setScore(player, 0);
      _SCOREBOARD(i, 'from').setScore(player, 0);
      _SCOREBOARD(i, 'to').setScore(player, 0);
      _SCOREBOARD(i, 'duration').setScore(player, 0);
    }

    removeTags(player, 'cooldown_');
    renderBars(player);

    return this
  }
}


/**
 * 
 * Renders all cooldown bar
 * in the UI
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function renderBars(player) {
  const typeToID = {
    'A': 1,
    'B': 2,
    'C': 3
  }
  const COOLDOWN_BARS = ['A', 'B', 'C'].map(bar => ({
    'type': bar,
    'id': zFill(_SCOREBOARD(typeToID[bar], 'id').getScore(player), 2) || '00',
    'from': zFill(_SCOREBOARD(typeToID[bar], 'from').getScore(player), 3) || '000',
    'to': zFill(_SCOREBOARD(typeToID[bar], 'to').getScore(player), 3) || '000',
    'duration': zFill(_SCOREBOARD(typeToID[bar], 'duration').getScore(player), 3) || '000'
  }));


  if (COOLDOWN_BARS.some(bar => !bar.id)) return;

  player.onScreenDisplay.setTitle(`origins.resource_bar ${COOLDOWN_BARS.map(bar => `${bar.type}:${bar.id},${bar.from},${bar.to},${bar.duration}`).join(' ')}`);
  console.warn(COOLDOWN_BARS.map(bar => `${bar.type}:${bar.id},${bar.from},${bar.to},${bar.duration}`).join(' '))
}


/**
 * 
 * Counts down the cooldown
 * bar duration for the player
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function countDown(player) {

  const scoreboards = [1, 2, 3];
  scoreboards.forEach(board => {

    if (_SCOREBOARD(board, 'duration').getScore(player) == undefined) {
      _SCOREBOARD(board, 'duration').setScore(player, 0);
    }

    if (_SCOREBOARD(board, 'id').getScore(player) == 99) {
      _SCOREBOARD(board, 'id').setScore(player, 0);
      renderBars(player);
    }

    if (_SCOREBOARD(board, 'id').getScore(player) !== 0 && _SCOREBOARD(board, 'duration').getScore(player) === 0) {
      if (player.hasTag(`cooldown_${_SCOREBOARD(board, 'id').getScore(player)}`)) {

        player.removeTag(`cooldown_${_SCOREBOARD(board, 'id').getScore(player)}`);

        _SCOREBOARD(board, 'id').setScore(player, 99);
        _SCOREBOARD(board, 'from').setScore(player, 0);
        _SCOREBOARD(board, 'to').setScore(player, 0);

      } else {

        _SCOREBOARD(board, 'from').setScore(player, _SCOREBOARD(board, 'to').getScore(player) || 0);

      }
      renderBars(player)
    }

    _SCOREBOARD(board, 'duration').setScore(player, Math.max((_SCOREBOARD(board, 'duration').getScore(player) || 0) - 1, 0));
  });

}

toAllPlayers(countDown, TicksPerSecond * 0.9) /* Run every 1 second -- 0.1 second margin of error */
