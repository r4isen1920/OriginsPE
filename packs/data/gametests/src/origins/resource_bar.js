
import { TicksPerSecond, world } from '@minecraft/server';
import { toAllPlayers } from './player';
import { zFill } from '../utils/string';


/**
 * 
 * Returns the scoreboard
 * for the specified resource bar
 * 
 * @param { string | number } id 
 * @param { 'id' | 'from' | 'to' | 'duration' } type 
 * @returns { import('@minecraft/server').ScoreboardObjective }
 */
const playerScoreboard = function(id, type) {
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
   */
  constructor(id=1, from=0, to=100, duration=1) {
    this.id = id;
    this.from = from;
    this.to = to;
    this.duration = duration;
  }

  /**
   * 
   * Appends the resource bar to the
   * cooldown list
   * 
   * @param { import('@minecraft/server').Player } player 
   * 
   * @returns { ResourceBar }
   */
  push(player) {

    switch (true) {

      case playerScoreboard(1, 'id').getScore(player) !== 0:
        playerScoreboard(1, 'id').setScore(player, this.id);
        playerScoreboard(1, 'from').setScore(player, this.from);
        playerScoreboard(1, 'to').setScore(player, this.to);
        playerScoreboard(1, 'duration').setScore(player, this.duration);
        break

      case playerScoreboard(2, 'id').getScore(player) !== 0:
        playerScoreboard(2, 'id').setScore(player, this.id);
        playerScoreboard(2, 'from').setScore(player, this.from);
        playerScoreboard(2, 'to').setScore(player, this.to);
        playerScoreboard(2, 'duration').setScore(player, this.duration);
        break

      case playerScoreboard(3, 'id').getScore(player) !== 0:
        playerScoreboard(3, 'id').setScore(player, this.id);
        playerScoreboard(3, 'from').setScore(player, this.from);
        playerScoreboard(3, 'to').setScore(player, this.to);
        playerScoreboard(3, 'duration').setScore(player, this.duration);
        break

      default: return this
    }

    renderBars(player)

    return this
  }

  /**
   * 
   * Immediately ends the existing 
   * resource bar from the player
   * 
   * @param { import('@minecraft/server').Player } player 
   * @param { '1' | '2' | '3' } id 
   * 
   * @returns { ResourceBar }
   */
  pop(player, id) {

    playerScoreboard(id, 'duration').setScore(player, 0)
    renderBars(player)

    return this
  }

  /**
   * 
   * Clears the resource bar
   * from the player
   * 
   * @param { import('@minecraft/server').Player } player
   * 
   * @returns { ResourceBar }
   */
  clear(player) {
    player.onScreenDisplay.setTitle('origins.resource_bar A:00,000,000,000 B:00,000,000,000 C:00,000,000,000')
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
    'id': zFill(playerScoreboard(1, 'id').getScore(player), 2) || '00',
    'from': zFill(playerScoreboard(1, 'from').getScore(player), 3) || '000',
    'to': zFill(playerScoreboard(1, 'to').getScore(player), 3) || '000',
    'duration': zFill(playerScoreboard(1, 'duration').getScore(player), 3) || '000'
  }
  let COOLDOWN_BAR_B = {
    'id': zFill(playerScoreboard(2, 'id').getScore(player), 2) || '00',
    'from': zFill(playerScoreboard(2, 'from').getScore(player), 3) || '000',
    'to': zFill(playerScoreboard(2, 'to').getScore(player), 3) || '000',
    'duration': zFill(playerScoreboard(2, 'duration').getScore(player), 3) || '000'
  }
  let COOLDOWN_BAR_C = {
    'id': zFill(playerScoreboard(3, 'id').getScore(player), 2) || '00',
    'from': zFill(playerScoreboard(3, 'from').getScore(player), 3) || '000',
    'to': zFill(playerScoreboard(3, 'to').getScore(player), 3) || '000',
    'duration': zFill(playerScoreboard(3, 'duration').getScore(player), 3) || '000'
  }

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

  if (!playerScoreboard(1, 'id').getScore(player) || !playerScoreboard(2, 'id').getScore(player) || !playerScoreboard(3, 'id').getScore(player)) return

  switch (true) {

    case playerScoreboard(1, 'duration').getScore(player) === 0:
      playerScoreboard(1, 'id').setScore(player, 0);
      playerScoreboard(1, 'from').setScore(player, 0);
      playerScoreboard(1, 'to').setScore(player, 0);

      renderBars(player)
      break

    case playerScoreboard(2, 'duration').getScore(player) === 0:
      playerScoreboard(2, 'id').setScore(player, 0);
      playerScoreboard(2, 'from').setScore(player, 0);
      playerScoreboard(2, 'to').setScore(player, 0);

      renderBars(player)
      break

    case playerScoreboard(3, 'duration').getScore(player) === 0:
      playerScoreboard(3, 'id').setScore(player, 0);
      playerScoreboard(3, 'from').setScore(player, 0);
      playerScoreboard(3, 'to').setScore(player, 0);

      renderBars(player)
      break

    default: return
  }

  playerScoreboard(1, 'duration').setScore(player, Math.max(playerScoreboard(1, 'duration').getScore(player) || 0 - 1, 0));
  playerScoreboard(2, 'duration').setScore(player, Math.max(playerScoreboard(2, 'duration').getScore(player) || 0 - 1, 0));
  playerScoreboard(3, 'duration').setScore(player, Math.max(playerScoreboard(3, 'duration').getScore(player) || 0 - 1, 0));

}

toAllPlayers(countDown, TicksPerSecond * 1) /* Run every 1 second */
