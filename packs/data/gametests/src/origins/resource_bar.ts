import { system, world, Player, ScoreboardObjective } from '@minecraft/server';

import { removeTags } from '../utils/tags';


/**
 * 
 * Returns the specified scoreboard
 * objective
 * 
 * @param id 
 */
export const _SCOREBOARD = function(id: string): ScoreboardObjective {
  return world.scoreboard.getObjective(id) || world.scoreboard.addObjective(id, id)
}

/**
 * 
 * Handles the resource bar or
 * cooldown renderer for the Origins
 * abilities
 */
export class ResourceBar {
  id: number;
  from: number;
  to: number;
  duration: number;
  persist: boolean;

  /**
   * 
   * Creates a new instance of
   * resource bar
   * 
   * @param id 
   * The numerical ID of the cooldown bar from `textures/origins/hud/cooldown/`
   * @param from 
   * The start value of the cooldown from 1 to 100 percent
   * @param to 
   * The end value of the cooldown from 1 to 100 percent
   * @param duration 
   * The duration of the cooldown in seconds
   * @param persist 
   * Whether to remove the cooldown bar or not when the duration ends
   */
  constructor(id: number = 1, from: number = 0, to: number = 100, duration: number = 1, persist: boolean = false) {
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
   * @param player 
   * The player to send the cooldown to
   * 
   * @returns 
   */
  push(player: Player): ResourceBar {

    _SCOREBOARD('cd').setScore(player, this.id);
    _SCOREBOARD('cdfrom').setScore(player, this.from);
    _SCOREBOARD('cdto').setScore(player, this.to);
    _SCOREBOARD('cdduration').setScore(player, this.duration);
    _SCOREBOARD('cdpersist').setScore(player, this.persist ? 1 : 0);

    if (!this.persist) player.addTag(`cooldown_${this.id}`);

    return this;
  }

  /**
   * 
   * Immediately ends the existing 
   * resource bar from the player
   * 
   * @param player 
   * The player to send the push to
   * @param id 
   * The ID of the cooldown bar to remove
   * 
   * @returns 
   */
  pop(player: Player, id: number = this.id): ResourceBar {
    _SCOREBOARD('cdhide').setScore(player, id);

    return this
  }

  /**
   * 
   * Clears the resource bar from the player
   * 
   * @param player 
   * The player to send the push to
   */
  clear(player: Player): void {

    _SCOREBOARD('cd1duration').setScore(player, 0);
    _SCOREBOARD('cd2duration').setScore(player, 0);
    _SCOREBOARD('cd3duration').setScore(player, 0);

    removeTags(player, 'cooldown_')

  }
}


/**
 * 
 * Intercept requests from the animation
 * controller via commands
 */
system.afterEvents.scriptEventReceive.subscribe(
  event => {

    const { id, message, sourceEntity } = event;

    if (id !== 'r4isen1920_originspe:resource_bar' || sourceEntity?.typeId !== 'minecraft:player') return;

    const player = sourceEntity as Player;

    switch (message) {

      case 'cd_end.1':
        player.removeTag(`cooldown_${_SCOREBOARD('cd1').getScore(player)}`);
        break;

      case 'cd_end.2':
        player.removeTag(`cooldown_${_SCOREBOARD('cd2').getScore(player)}`);
        break;

      case 'cd_end.3':
        player.removeTag(`cooldown_${_SCOREBOARD('cd3').getScore(player)}`);
        break;

    }
  }, { namespaces: [ 'r4isen1920_originspe' ] }
)
