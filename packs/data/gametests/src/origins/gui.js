
import { world, system, ItemStack, TicksPerSecond, ItemLockMode } from "@minecraft/server";

import { Vector3 } from "../utils/Vec3";
import { removeTags } from "../utils/tags";
import { toAllPlayers } from "./player";


/**
 * 
 * Runs the dialogue command for the given dialogue ID
 * 
 * @param { import('@minecraft/server').Player } player 
 * @param { string } dialogueId 
 */
export function runDialogueCommand(player, dialogueId) {
  if (player.dimension.getEntities({
    type: 'r4isen1920_originspe:dialogue_handler',
    location: player.location,
    maxDistance: 32
  }).length === 0) {
    player.dimension.spawnEntity('r4isen1920_originspe:dialogue_handler', Vector3.add(player.location, new Vector3(0, 1, 0)));
  }

  removeTags(player, 'was_')
  player.removeTag('load_failed');
  player.addTag(`was_${setPlayerGameMode(player)}`)

  //* console.warn(`open GUI: ${dialogueId}`)

  const _A = system.runInterval(() => {
    player.runCommand(`dialogue open @e[type=r4isen1920_originspe:dialogue_handler,c=1] @s ${dialogueId}`);
    if (world.scoreboard.getObjective('gui')?.getScore(player) === 1) system.clearRun(_A);
  }, 4)
}

/**
 * 
 * Opens the screen picker
 * GUI for the given player
 * 
 * @param { import('@minecraft/server').Player } player 
 * @param { 'race' | 'class' } set 
 * @param { 'pick' | 'change' | 'view' | 'viewonly' } viewType 
 */
export function openScreenPickerGUI(player, set='race', viewType='pick') {
  const playerOrigin = player.getTags().find(tag => tag.startsWith(`${set}_`))?.replace(`${set}_`, '');
  const dialogueId = playerOrigin ? `gui_${set}_${viewType}_${playerOrigin}` : `gui_${set}_${viewType}_${set === 'race' ? 'human' : 'nitwit'}`;

  runDialogueCommand(player, dialogueId);

  switch (viewType) {

    case 'pick':
      player.removeTag(`has_any_${set}`);
      removeTags(player, `${set}_`);
      break;

    case 'view':
      player.playSound('ui.enchant', { volume: 1, pitch: 1.25 })
      break;

  }
}

/**
 * 
 * Opens the options GUI for
 * the given player
 * 
 * @param { import('@minecraft/server').Player } player 
 * @param { string } optionType 
 */
export function openOptionsGUI(player, optionType) {

  let dialogueId = '';

  switch (true) {

    case optionType === 'general':
      if (player.getProperty('r4isen1920_originspe:toggle_particles')) dialogueId = 'gui_options_general_root_particleon'
      else dialogueId = 'gui_options_general_root_particleoff'
      break;

    case optionType === 'view_origin':
      openScreenPickerGUI(player, 'race', 'viewonly')
      break;
    case optionType === 'view_class':
      openScreenPickerGUI(player, 'class', 'viewonly')
      break;
  
    case optionType === 'admin':
      if (player.hasTag('origins_admin')) dialogueId = 'gui_options_admin_root'
      else dialogueId = 'gui_options_admin_denied'
      break;
    case optionType === 'admin_toggle':
      /**
       * @param { 'orb' | 'paper' | 'unique' | 'announce' } toggleName 
       * @returns { number }
       */
      const toggleValue = function(toggleName) {
        let score = 0;

        try {
          score = world.scoreboard.getObjective('index').getScore(`toggle_${toggleName}`)
        } catch {
          world.scoreboard.getObjective('index').setScore(`toggle_${toggleName}`, toggleName === 'unique' ? 0 : 1)
        }

        return world.scoreboard.getObjective('index').getScore(`toggle_${toggleName}`);
      }
      dialogueId = `gui_options_admin_toggle_root_${toggleValue('orb')}${toggleValue('paper')}${toggleValue('unique')}${toggleValue('announce')}`;
      break;
  }

  if (dialogueId === '') return

  player.removeTag('_out_of_ui');
  runDialogueCommand(player, dialogueId);

}

/**
 * 
 * Turns the player into survival mode
 * for on_close and on_open commands processing
 * and returns the gamemode they were on
 * 
 * @param { import('@minecraft/server').Player } player 
 * @returns { import('@minecraft/server').GameMode }
 */
export function setPlayerGameMode(player) {

  const gameModes = [ 'adventure', 'creative', 'spectator', 'survival' ]
  const prevGamemode = gameModes.find(gamemode => player.matches({ gameMode: gamemode }))

  player.addEffect('invisibility', TicksPerSecond * 255, { amplifier: 255, showParticles: false });
  player.addEffect('resistance', TicksPerSecond * 255, { amplifier: 255, showParticles: false });

  const commands = [
    'gamerule sendcommandfeedback false',
    'gamemode survival',
    'gamerule sendcommandfeedback true',
    'function r4isen1920_originspe/clearchat'
  ];
  commands.forEach(command => player.runCommand(command));

  return prevGamemode
}

/**
 * 
 * Runs when the GUI is closed
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function onCloseGUI(player) {
  player.addTag('_out_of_ui');
  player.removeTag('change_resign');
  player.removeTag('_init_bar');

  player.removeEffect('invisibility');
  player.removeEffect('resistance');

  const prevGamemode = player.getTags().find(tag => tag.startsWith('was_'))
  if (prevGamemode) {
    player.runCommand(`gamemode ${prevGamemode.replace('was_', '')}`)
    player.removeTag(`was_${prevGamemode}`)
  }
}

/**
 * 
 * Sets up the Origins menu item for the given player
 * 
 * @param { import('@minecraft/server').Player } player 
 */
export function setupMenuItem(player) {

  /**
   * @type { import('@minecraft/server').Container }
   */
  const inventoryComponent = player.getComponent('inventory').container;
  if (inventoryComponent.getItem(8)?.typeId !== 'r4isen1920_originspe:origins_menu') {

  const originsMenuItem = new ItemStack('r4isen1920_originspe:origins_menu');
    originsMenuItem.lockMode = ItemLockMode.slot;
    originsMenuItem.keepOnDeath = true;
    inventoryComponent.setItem(8, originsMenuItem);

  }

}

toAllPlayers(setupMenuItem, TicksPerSecond * 2, TicksPerSecond * 10);

/**
 * 
 * Intercepts GUI requests via server commands
 */
system.afterEvents.scriptEventReceive.subscribe(event => {

  const { id, message, sourceEntity } = event;

  if (id !== 'r4isen1920_originspe:gui' || !sourceEntity) return

  const playerOrigin = sourceEntity.getTags().find(tag => tag.startsWith(`race_`));
  const playerClass = sourceEntity.getTags().find(tag => tag.startsWith(`class_`));

  switch (message) {
    case 'open_screen_picker_race':
      if (!playerOrigin) openScreenPickerGUI(sourceEntity, 'race');
      else onCloseGUI(sourceEntity)
      break;
    case 'open_screen_picker_class':
      if (!playerClass) openScreenPickerGUI(sourceEntity, 'class');
      else onCloseGUI(sourceEntity)
      break;
    case 'on_close': 
      onCloseGUI(sourceEntity)
      break;

    case 'open_options_general':
      openOptionsGUI(sourceEntity, 'general')
      break;
    case 'open_options_view_origin':
      openOptionsGUI(sourceEntity, 'view_origin')
      break;
    case 'open_options_view_class':
      openOptionsGUI(sourceEntity, 'view_class')
      break;
    case 'open_options_admin':
      openOptionsGUI(sourceEntity, 'admin')
      break;
    case 'open_options_admin_toggle':
      openOptionsGUI(sourceEntity, 'admin_toggle')
      break;

    default:
      console.warn(`[r4isen1920][OriginsPE] Unknown GUI request: ${message}`);
      break;
  }

}, { namespaces: [ 'r4isen1920_originspe' ] })
