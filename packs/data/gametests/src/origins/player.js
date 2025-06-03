
import { world, system, GameMode } from "@minecraft/server";

import { openScreenPickerGUI, setupMenuItem } from "./gui.js";
import { removeTags } from "../utils/tags.js";
import { ResourceBar } from "./resource_bar.js";

/**
 * 
 * List of available Origins to randomize
 * from
 */
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
  'diviner',
  'mole',
  'rootkin',
]

/**
 * 
 * List of available Classes to
 * randomize from
 */
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
 * Default imports for Origins and Classes
 */
const DEFAULT_IMPORT = {
  'powers': [
    "master_of_webs",
  ],
  'perks': [

    'better_stew',
    'longer_potions',
    'more_saturated_food',
    'powerful_potions',
    'quality_equipment',
  
  ],
  'controls': [],
  'effects': {
    'model': 'normal',
    'skin': 'normal',
    'emitter': 'none'
  }
}

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

  new ResourceBar().clear(player);

  removeTags(player, '_');
  player.addTag(`race_${param_race}`);
  player.addTag('has_any_race');

  resetPlayerAttributes(player);
  initModules(player);

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

  removeTags(player, '_');
  player.addTag(`class_${param_class}`);
  player.addTag('has_any_class');

  resetPlayerAttributes(player);
  initModules(player);

  openScreenPickerGUI(player, 'class', 'view');
}

/**
 * 
 * Initializes the required modules for
 * the player's selected Origin and Class
 * 
 * @param { import('@minecraft/server').Player } player 
 */
export async function initModules(player) {

  if (player.hasTag('load_failed')) return;

  const _IMPORT_ORIGIN = DEFAULT_IMPORT;
  const _IMPORT_CLASS = DEFAULT_IMPORT;

  let ORIGIN_POWERS = [];
  let CLASS_PERKS = [];
  let CONTROLS = [];
  let EFFECTS = {};


  const playerOrigin = player.getTags().find(tag => tag.startsWith('race_'))?.replace('race_', '') || 'human';
  const playerClass = player.getTags().find(tag => tag.startsWith('class_'))?.replace('class_', '') || 'nitwit';

  removeTags(player, 'power_');
  removeTags(player, 'perk_');
  removeTags(player, 'control_');


  try {
    await import(`../data/origins/${playerOrigin}.js`).then(mod => {
      if (mod) {
        ORIGIN_POWERS = [..._IMPORT_ORIGIN.powers, ...(mod[playerOrigin].powers || [])];
        CONTROLS = [..._IMPORT_ORIGIN.controls, ...(mod[playerOrigin].controls || [])];
        EFFECTS = { ..._IMPORT_ORIGIN.effects, ...mod[playerOrigin].effects };
      } else player.addTag('load_failed');
    })
  } catch (e) {
    console.warn(`[r4isen1920][OriginsPE] Failed to load Origin: '${playerOrigin}' for ${player.name}`);
    console.warn(`[r4isen1920][OriginsPE] ${e}`);
    player.addTag('load_failed');
  }

  try {
    await import(`../data/classes/${playerClass}.js`).then(mod => {
      if (mod) {
        CLASS_PERKS = [..._IMPORT_CLASS.perks, ...(mod[playerClass].perks || [])];
        CONTROLS.push(..._IMPORT_CLASS.controls, ...(mod[playerClass].controls || []));
      } else player.addTag('load_failed');
    })
  } catch (e) {
    console.warn(`[r4isen1920][OriginsPE] Failed to load Class: '${playerClass}' for ${player.name}`);
    console.warn(`[r4isen1920][OriginsPE] ${e}`);
    player.addTag('load_failed');
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

  loadPlayerEffects(player, 'model', EFFECTS.model);
  loadPlayerEffects(player, 'skin', EFFECTS.skin);
  loadPlayerEffects(player, 'emitter', EFFECTS.emitter);

  setupMenuItem(player);

  if(player.hasTag('power_phantomize') && player.getGameMode() === GameMode.spectator) {
    player.addTag('_phantomized');
  }
}


/**
 * 
 * Loads a player effect
 * 
 * @param { import('@minecraft/server').Player } player 
 * @param { string } type
 * @param { string } value
 */
function loadPlayerEffects(player, type, value) {
  try {
    player.triggerEvent(`r4isen1920_originspe:${type}_type.${value}`);
  } catch (e) {
    console.warn(`[r4isen1920][OriginsPE] Failed to load ${type} effect: '${value}' for ${player.name}`);
    console.warn(`[r4isen1920][OriginsPE] ${e}`);
  }
}


/**
 * 
 * @param { string } path 
 * @param { string } errMsg 
 * @returns { Promise<object> }
 */
export async function importOriginsModule(path, errMsg) {
  try {
    return await import(path);
  } catch (e) {
    console.warn(`[r4isen1920][OriginsPE] ${errMsg}`);
    console.warn(`[r4isen1920][OriginsPE] ${e}`);
    return null;
  }
}


/**
 * 
 * Reset the player's attributes
 * 
 * @param { import('@minecraft/server').Player } player 
 */
export function resetPlayerAttributes(player) {

  const events = [
    'r4isen1920_originspe:movement.0.1',
    'r4isen1920_originspe:underwater_movement.0.025',
    'r4isen1920_originspe:health.20',
    'r4isen1920_originspe:attack.1',
    'r4isen1920_originspe:scale.1',
    'r4isen1920_originspe:exhaustion.normal',
    'r4isen1920_originspe:family_type.player',
    'r4isen1920_originspe:breathable.land',
    'r4isen1920_originspe:buoyant.normal',
    'r4isen1920_originspe:projectile_spawner.reset',
    'r4isen1920_originspe:is_shaking.false',
    'r4isen1920_originspe:burns_in_daylight.false',
    'r4isen1920_originspe:display_name.true',
    'r4isen1920_originspe:has_divine_aura.false'
  ];
  events.forEach(event => player.triggerEvent(event));

  player.getComponent('scale').value = 1.0;
  removeTags(player, '_');

  player.clearDynamicProperties();

}

/**
 * 
 * Runs a function with an interval
 * for all players in the world
 * 
 * @param { function } func 
 * The function to run
 * @param { number } interval 
 * The interval to run the function at
 * @param { number } timeout 
 * The timeout before the function runs
 */
export function toAllPlayers(func, interval=1, timeout=interval) {
  system.runTimeout(() => {
    system.runInterval(() => {
      world.getAllPlayers().forEach(player => func(player))
    }, interval)
  }, timeout)
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

    case message === 'reset':
      resetPlayerAttributes(sourceEntity);
      initModules(sourceEntity);
      break;

    case message === 'become_race_unknown':
      removeTags(sourceEntity, '_');
      openScreenPickerGUI(sourceEntity, 'race', 'pick');
      break;
    case message === 'become_class_unknown':
      removeTags(sourceEntity, '_');
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

}, { namespaces: [ 'r4isen1920_originspe' ] })
