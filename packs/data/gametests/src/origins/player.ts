import { world, system, GameMode, Player } from "@minecraft/server";

import { openScreenPickerGUI, setupMenuItem } from "./gui";
import { removeTags } from "../utils/tags";
import { ResourceBar } from "./resource_bar";
import { ORIGIN_REGISTRY, CLASS_REGISTRY  } from "../data/registry";


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
  'controls': [] as string[],
  'effects': {
    'model': 'normal',
    'skin': 'normal',
    'emitter': 'none'
  }
}

function setRace(player: Player, param_race: string): void {
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

function setClass(player: Player, param_class: string): void {
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

export async function initModules(player: Player): Promise<void> {

  if (player.hasTag('load_failed')) return;

  const _IMPORT_ORIGIN = DEFAULT_IMPORT;
  const _IMPORT_CLASS = DEFAULT_IMPORT;

  let ORIGIN_POWERS: string[] = [];
  let CLASS_PERKS: string[] = [];
  let CONTROLS: string[] = [];
  let EFFECTS: { model?: string; skin?: string; emitter?: string } = {};


  const playerOrigin = player.getTags().find(tag => tag.startsWith('race_'))?.replace('race_', '') || 'human';
  const playerClass = player.getTags().find(tag => tag.startsWith('class_'))?.replace('class_', '') || 'nitwit';

  removeTags(player, 'power_');
  removeTags(player, 'perk_');
  removeTags(player, 'control_');

  const originData = ORIGIN_REGISTRY[playerOrigin];
  if (originData) {
    ORIGIN_POWERS = [..._IMPORT_ORIGIN.powers, ...(originData.powers || [])];
    CONTROLS = [..._IMPORT_ORIGIN.controls, ...(originData.controls || [])];
    EFFECTS = { ..._IMPORT_ORIGIN.effects, ...originData.effects };
  }
  else {
    player.addTag('load_failed');
  }

  const classData = CLASS_REGISTRY[playerClass];
  if (classData) {
    CLASS_PERKS = [..._IMPORT_CLASS.perks, ...(classData.perks || [])];
    CONTROLS.push(..._IMPORT_CLASS.controls, ...(classData.controls || []));
  }
  else {
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

  if(player.hasTag('power_phantomize') && player.getGameMode() === GameMode.Spectator) {
    player.addTag('_phantomized');
  }
}


function loadPlayerEffects(player: Player, type: string, value: string | undefined): void {
  try {
    player.triggerEvent(`r4isen1920_originspe:${type}_type.${value}`);
  } catch (e) {
    console.warn(`[r4isen1920][OriginsPE] Failed to load ${type} effect: '${value}' for ${player.name}`);
    console.warn(`[r4isen1920][OriginsPE] ${e}`);
  }
}


export async function importOriginsModule(path: string, errMsg: string): Promise<object | null> {
  try {
    return await import(path);
  } catch (e) {
    console.warn(`[r4isen1920][OriginsPE] ${errMsg}`);
    console.warn(`[r4isen1920][OriginsPE] ${e}`);
    return null;
  }
}


export function resetPlayerAttributes(player: Player): void {

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

  removeTags(player, '_');

  player.camera.clear();

  player.clearDynamicProperties();

}


export function toAllPlayers(func: (player: Player) => void, interval = 1) {
  return system.runInterval(() => {
    const players = world.getAllPlayers();
    for (const player of players) {
      if (player.isValid) {
        func(player);
      }
    }
  }, interval);
}
world.afterEvents.entityDie.subscribe((event) => {
  const player = event.deadEntity;

  if (!player || player.typeId !== 'minecraft:player') return;

  system.runTimeout(() => {
    const inventory = (player as Player).getComponent('inventory');
    if (!inventory) return;

    const container = inventory.container;
    if (!container) return;
    for (let i = 0; i < container.size; i++) {
      container.setItem(i, undefined);
    }
  }, 1);
})

system.afterEvents.scriptEventReceive.subscribe(event => {

  const { id, message, sourceEntity } = event;

  if (id !== 'r4isen1920_originspe:player' || !sourceEntity || message.length === 0) return

  const player = sourceEntity as Player;

  switch (true) {

    case message === 'reset':
      resetPlayerAttributes(player);
      initModules(player);
      break;

    case message === 'become_race_unknown':
      removeTags(player, '_');
      openScreenPickerGUI(player, 'race', 'pick');
      break;
    case message === 'become_class_unknown':
      removeTags(player, '_');
      openScreenPickerGUI(player, 'class', 'pick');
      break;

    case message === 'become_race_random':
      setRace(player, 'random');
      break;
    case message === 'become_class_random':
      setClass(player, 'random');
      break;

    case message.startsWith('become_race_'):
      setRace(player, message.replace('become_race_', ''));
      break;
    case message.startsWith('become_class_'):
      setClass(player, message.replace('become_class_', ''));
      break;

    default:
      break;
  }

}, { namespaces: [ 'r4isen1920_originspe' ] })
