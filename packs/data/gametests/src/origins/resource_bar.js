
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

    switch (true) {

      case _SCOREBOARD(1, 'id').getScore(player) || 0 === 0:
        _SCOREBOARD(1, 'id').setScore(player, this.id);
        _SCOREBOARD(1, 'from').setScore(player, this.from);
        _SCOREBOARD(1, 'to').setScore(player, this.to);
        _SCOREBOARD(1, 'duration').setScore(player, this.duration);
        break

      case _SCOREBOARD(2, 'id').getScore(player) || 0 === 0:
        _SCOREBOARD(2, 'id').setScore(player, this.id);
        _SCOREBOARD(2, 'from').setScore(player, this.from);
        _SCOREBOARD(2, 'to').setScore(player, this.to);
        _SCOREBOARD(2, 'duration').setScore(player, this.duration);
        break

      case _SCOREBOARD(3, 'id').getScore(player) || 0 === 0:
        _SCOREBOARD(3, 'id').setScore(player, this.id);
        _SCOREBOARD(3, 'from').setScore(player, this.from);
        _SCOREBOARD(3, 'to').setScore(player, this.to);
        _SCOREBOARD(3, 'duration').setScore(player, this.duration);
        break

      default: return this
    }

    if (!this.persist) player.addTag(`cooldown_${this.id}`)
    if (flush) renderBars(player)

    return this
  }

  /**
   * 
   * Updates existing resource bar
   * matching the provided id from
   * the cooldown list
   * 
   * @param { import('@minecraft/server').Player } player 
   * The player to send the cooldown to
   * @param { number } from 
   * The start value of the cooldown from 1 to 100 percent
   * @param { number } to 
   * The end value of the cooldown from 1 to 100 percent
   * @param { number } duration 
   * The duration of the cooldown in seconds
   * 
   * @returns { ResourceBar }
   */
  update(player, from=this.from, to=this.to, duration=this.duration) {

    switch (true) {

      case _SCOREBOARD(1, 'id').getScore(player) === this.id:
        _SCOREBOARD(1, 'id').setScore(player, this.id);
        _SCOREBOARD(1, 'from').setScore(player, from);
        _SCOREBOARD(1, 'to').setScore(player, to);
        _SCOREBOARD(1, 'duration').setScore(player, duration);
        break

      case _SCOREBOARD(2, 'id').getScore(player) === this.id:
        _SCOREBOARD(2, 'id').setScore(player, this.id);
        _SCOREBOARD(2, 'from').setScore(player, from);
        _SCOREBOARD(2, 'to').setScore(player, to);
        _SCOREBOARD(2, 'duration').setScore(player, duration);
        break

      case _SCOREBOARD(3, 'id').getScore(player) === this.id:
        _SCOREBOARD(3, 'id').setScore(player, this.id);
        _SCOREBOARD(3, 'from').setScore(player, from);
        _SCOREBOARD(3, 'to').setScore(player, to);
        _SCOREBOARD(3, 'duration').setScore(player, duration);
        break

      default: return this
    }

    player.addTag(`cooldown_${this.id}`)
    renderBars(player)

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

    switch (true) {

      case _SCOREBOARD(1, 'id').getScore(player) === id:
        _SCOREBOARD(1, 'duration').setScore(player, 0);
        break

      case _SCOREBOARD(2, 'id').getScore(player) === id:
        _SCOREBOARD(2, 'duration').setScore(player, 0);
        break

      case _SCOREBOARD(3, 'id').getScore(player) === id:
        _SCOREBOARD(3, 'duration').setScore(player, 0);
        break

      default: return this
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
    
    _SCOREBOARD(1, 'id').setScore(player, 0);
    _SCOREBOARD(1, 'from').setScore(player, 0);
    _SCOREBOARD(1, 'to').setScore(player, 0);
    _SCOREBOARD(1, 'duration').setScore(player, 0);

    _SCOREBOARD(2, 'id').setScore(player, 0);
    _SCOREBOARD(2, 'from').setScore(player, 0);
    _SCOREBOARD(2, 'to').setScore(player, 0);
    _SCOREBOARD(2, 'duration').setScore(player, 0);

    _SCOREBOARD(3, 'id').setScore(player, 0);
    _SCOREBOARD(3, 'from').setScore(player, 0);
    _SCOREBOARD(3, 'to').setScore(player, 0);
    _SCOREBOARD(3, 'duration').setScore(player, 0);

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

  let COOLDOWN_BAR_A = {
    'id': zFill(_SCOREBOARD(1, 'id').getScore(player), 2) || '00',
    'from': zFill(_SCOREBOARD(1, 'from').getScore(player), 3) || '000',
    'to': zFill(_SCOREBOARD(1, 'to').getScore(player), 3) || '000',
    'duration': zFill(_SCOREBOARD(1, 'duration').getScore(player), 3) || '000'
  }
  let COOLDOWN_BAR_B = {
    'id': zFill(_SCOREBOARD(2, 'id').getScore(player), 2) || '00',
    'from': zFill(_SCOREBOARD(2, 'from').getScore(player), 3) || '000',
    'to': zFill(_SCOREBOARD(2, 'to').getScore(player), 3) || '000',
    'duration': zFill(_SCOREBOARD(2, 'duration').getScore(player), 3) || '000'
  }
  let COOLDOWN_BAR_C = {
    'id': zFill(_SCOREBOARD(3, 'id').getScore(player), 2) || '00',
    'from': zFill(_SCOREBOARD(3, 'from').getScore(player), 3) || '000',
    'to': zFill(_SCOREBOARD(3, 'to').getScore(player), 3) || '000',
    'duration': zFill(_SCOREBOARD(3, 'duration').getScore(player), 3) || '000'
  }

  //* console.warn(`${JSON.stringify(COOLDOWN_BAR_A)} || ${JSON.stringify(COOLDOWN_BAR_B)} || ${JSON.stringify(COOLDOWN_BAR_C)}`)

  if (!COOLDOWN_BAR_A.id || !COOLDOWN_BAR_B.id || !COOLDOWN_BAR_C.id) return

  player.onScreenDisplay.setTitle(`origins.resource_bar A:${COOLDOWN_BAR_A.id},${COOLDOWN_BAR_A.from},${COOLDOWN_BAR_A.to},${COOLDOWN_BAR_A.duration} B:${COOLDOWN_BAR_B.id},${COOLDOWN_BAR_B.from},${COOLDOWN_BAR_B.to},${COOLDOWN_BAR_B.duration} C:${COOLDOWN_BAR_C.id},${COOLDOWN_BAR_C.from},${COOLDOWN_BAR_C.to},${COOLDOWN_BAR_C.duration}`)
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

toAllPlayers(countDown, TicksPerSecond * 1) /* Run every 1 second */
