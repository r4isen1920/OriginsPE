
import { system, world } from '@minecraft/server';

import { removeTags } from '../utils/tags';


/**
 * 
 * Returns the specified scoreboard
 * objective
 * 
 * @param { string } id 
 */
export const _SCOREBOARD = function(id) {
  return world.scoreboard.getObjective(id) || world.scoreboard.addObjective(id, id)
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
   * 
   * @returns { ResourceBar }
   */
  push(player) {

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
   * @param { import('@minecraft/server').Player } player 
   * The player to send the push to
   * @param { number } id 
   * The ID of the cooldown bar to remove
   * 
   * @returns { ResourceBar }
   */
  pop(player, id=this.id) {
    _SCOREBOARD('cdhide').setScore(player, id);

    return this
  }

  /**
   * 
   * Clears the resource bar from the player
   * 
   * @param { import('@minecraft/server').Player } player 
   * The player to send the push to
   */
  clear(player) {

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

    switch (message) {

      case 'cd_end.1':
        sourceEntity.removeTag(`cooldown_${_SCOREBOARD('cd1').getScore(sourceEntity)}`);
        break;

      case 'cd_end.2':
        sourceEntity.removeTag(`cooldown_${_SCOREBOARD('cd2').getScore(sourceEntity)}`);
        break;

      case 'cd_end.3':
        sourceEntity.removeTag(`cooldown_${_SCOREBOARD('cd3').getScore(sourceEntity)}`);
        break;

    }
  }, { namespaces: [ 'r4isen1920_originspe' ] }
)
