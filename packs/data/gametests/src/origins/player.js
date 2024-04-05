
import { world, system, TicksPerSecond, ItemStack, ItemLockMode } from "@minecraft/server";

import { openScreenPickerGUI } from "./gui.js";
import { removeTags } from "../utils/tags.js";


const ORIGINS = [
  'avian',
  'arachnid',
  'elytrian',
  'shulk',
  'feline',
  'enderian',
  'merling',
  'blazeborn',
  'phantom',
  'kitsune',
  'slimecican',
  'inchling',
  'bee',
  'piglin',
  'starborne',
  'elf',
  'voidwalker',
]

const CLASSES = [
  'archer',
  'beastmaster',
  'blacksmith',
  'cleric',
  'cook',
  'explorer',
  'farmer',
  'lumberjack',
  'merchant',
  'miner',
  'rancher',
  'rogue',
  'warrior',
]

/**
 * 
 * Set the Origin (race) of a player
 * 
 * @param { import('@minecraft/server').Player } player 
 * @param { string } param_race 
 */
function setRace(player, param_race) {
  if (param_race === 'random') {
    param_race = ORIGINS[Math.floor(Math.random() * ORIGINS.length)]
  }
  player.addTag(`race_${param_race}`)
  openScreenPickerGUI(player, 'race', 'view');
}

/**
 * 
 * Set the Class of a player
 * 
 * @param { import('@minecraft/server').Player } player 
 * @param { string } param_class 
 */
function setClass(player, param_class) {
  if (param_class === 'random') {
    param_class = CLASSES[Math.floor(Math.random() * CLASSES.length)]
  }
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
  let CLASS_PERKS = [];
  let CONTROLS = [];

  removeTags(player, 'power_');
  removeTags(player, 'perk_');
  removeTags(player, 'control_');

  try {

    await import(`../data/origins/${playerOrigin}.js`).then(mod => ORIGIN_POWERS = mod[playerOrigin].powers);
    await import(`../data/classes/${playerClass}.js`).then(mod => CLASS_PERKS = mod[playerClass].perks);

    try {

      await import(`../data/origins/${playerOrigin}.js`).then(mod => CONTROLS.push(...mod[playerOrigin].controls));
      await import(`../data/classes/${playerClass}.js`).then(mod => CONTROLS.push(...mod[playerClass].controls));

    } catch (e) {
      if (!(e instanceof TypeError)) throw e;
    }

  } catch (e) {

    console.warn(`[r4isen1920][OriginsPE] Failed to load Origins and classes for ${player.name} (${playerOrigin}, ${playerClass})`);
    console.warn(`[r4isen1920][OriginsPE] ${e instanceof TypeError ? 'Missing property "powers" or "perks"' : e}`);

    player.addTag('load_failed');

    return

  }

  ORIGIN_POWERS.forEach(power => {
    player.addTag(`power_${power}`)
  })
  CLASS_PERKS.forEach(perk => {
    player.addTag(`perk_${perk}`)
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
  player.triggerEvent('r4isen1920_originspe:attack.1');
  player.triggerEvent('r4isen1920_originspe:exhaustion.normal');
  player.triggerEvent('r4isen1920_originspe:family_type.player');
  player.triggerEvent('r4isen1920_originspe:breathable.land');
  player.triggerEvent('r4isen1920_originspe:buoyant.normal');

  removeTags(player, '_');

}


/**
 * 
 * Runs a function with an interval
 * for all players in the world
 * 
 * @param { function } func 
 * @param { number } interval 
 */
export function toAllPlayers(func, interval=1) {
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

    case message === 'become_race_random':
      setRace(sourceEntity, 'random');
      break;
    case message === 'become_class_random':
      setClass(sourceEntity, 'random');
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
