
import { world, system } from "@minecraft/server";

import { openScreenPickerGUI } from "./gui.js";


/**
 * 
 * Set the Origin (race) of a player
 * 
 * @param { Player } player 
 * @param { string } param_race 
 */
function setRace(player, param_race) {

  player.addTag(`race_${param_race}`)
  openScreenPickerGUI(player, 'race', 'view');

}

/**
 * 
 * Set the Class of a player
 * 
 * @param { Player } player 
 * @param { string } sClass 
 */
function setClass(player, param_class) {

  player.addTag(`class_${param_class}`)
  openScreenPickerGUI(player, 'class', 'view');

}

/**
 * 
 * Intercept requests for player-specific events
 */
system.afterEvents.scriptEventReceive.subscribe(event => {

  const { id, message, sourceEntity } = event;

  if (id !== 'r4isen1920_originspe:player' || !sourceEntity || message.length === 0) return

  if (message.startsWith('become_race_')) {
    setRace(sourceEntity, message.replace('become_race_', ''))
  } else if (message.startsWith('become_class_')) {
    setClass(sourceEntity, message.replace('become_class_', ''))
  }

})
