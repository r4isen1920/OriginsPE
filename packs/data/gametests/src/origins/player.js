
import { world, system, TicksPerSecond, ItemStack, ItemLockMode } from "@minecraft/server";

import { openScreenPickerGUI } from "./gui.js";
import { removeTags } from "../utils/tags.js";


/**
 * 
 * Set the Origin (race) of a player
 * 
 * @param { import('@minecraft/server').Player } player 
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
 * @param { import('@minecraft/server').Player } player 
 * @param { string } sClass 
 */
function setClass(player, param_class) {
  player.addTag(`class_${param_class}`)
  openScreenPickerGUI(player, 'class', 'view');
}

/**
 * 
 * Initializes the player's abilities
 * 
 * @param { import('@minecraft/server').Player } player 
 */
export async function initAbilities(player) {

  if (player.hasTag('load_failed')) return;

  const playerOrigin = player.getTags().find(tag => tag.startsWith('race_'))?.replace('race_', '') || 'human';
  const playerClass = player.getTags().find(tag => tag.startsWith('class_'))?.replace('class_', '') || 'nitwit';

  let ORIGIN_POWERS = [];
  let CLASS_TRAITS = [];
  let CONTROLS = [];

  removeTags(player, 'power_');
  removeTags(player, 'trait_');
  removeTags(player, 'control_');

  try {

    await import(`../data/origins/${playerOrigin}.js`).then(mod => ORIGIN_POWERS = mod[playerOrigin].powers);
    await import(`../data/classes/${playerClass}.js`).then(mod => CLASS_TRAITS = mod[playerClass].traits);

    await import(`../data/origins/${playerOrigin}.js`).then(mod => CONTROLS.push(...mod[playerOrigin].controls));
    await import(`../data/classes/${playerClass}.js`).then(mod => CONTROLS.push(...mod[playerClass].controls));

  } catch (e) {

    console.warn(`[r4isen1920][OriginsPE] Failed to load Origins and classes for ${player.name} (${playerOrigin}, ${playerClass})`);
    console.warn(`[r4isen1920][OriginsPE] ${e}`);

    player.addTag('load_failed');

    return

  }

  ORIGIN_POWERS.forEach(power => {
    player.addTag(`power_${power}`)
  })
  CLASS_TRAITS.forEach(trait => {
    player.addTag(`trait_${trait}`)
  })

  CONTROLS.forEach(control => {
    player.addTag(`control_${control}`)
  })


  const originsMenuItem = new ItemStack('r4isen1920_originspe:origins_menu');
  originsMenuItem.lockMode = ItemLockMode.slot;
  player.getComponent('inventory').container.setItem(8, originsMenuItem);

}


/**
 * 
 * Reset the player's attributes
 * 
 * @param { import('@minecraft/server').Player } player 
 */
export function resetPlayerAttributes(player) {

  player.triggerEvent('r4isen1920_originspe:movement.0.1');
  player.triggerEvent('r4isen1920_originspe:health.20');

}


/**
 * 
 * Runs a function with an interval
 * for all players in the world
 * 
 * @param { function } func 
 * @param { number } interval 
 */
export function toAllPlayers(func, interval) {
  system.runInterval(() => {
    world.getAllPlayers().forEach(player => func(player))
  }, interval)
}

/**
 * 
 * Intercept requests for player-specific
 * events
 */
system.afterEvents.scriptEventReceive.subscribe(event => {

  const { id, message, sourceEntity } = event;

  if (id !== 'r4isen1920_originspe:player' || !sourceEntity || message.length === 0) return

  switch (true) {

    case message === 'become_race_unknown':
      openScreenPickerGUI(sourceEntity, 'race', 'pick');
      break;
    case message === 'become_class_unknown':
      openScreenPickerGUI(sourceEntity, 'class', 'pick');
      break;

    case message.startsWith('become_race_'):
      setRace(sourceEntity, message.replace('become_race_', ''));
      break;
    case message.startsWith('become_class_'):
      setClass(sourceEntity, message.replace('become_class_', ''));
      break;

    default:
      break;
  }

})

/**
 * 
 * Subscribe to event after 5 seconds
 * the server has started
 */
system.runTimeout(() => {toAllPlayers(initAbilities, TicksPerSecond * 1)}, TicksPerSecond * 5)
