import { world, system, ItemStack, TicksPerSecond, ItemLockMode, GameMode, Player, Container, Entity } from "@minecraft/server";

import { removeTags } from "../utils/tags";
import { toAllPlayers } from "./player";
import { _SCOREBOARD } from "./resource_bar";


/**
 * 
 * Runs the dialogue command for the given dialogue ID
 * 
 * @param player 
 * @param dialogueId 
 */
export function runDialogueCommand(player: Player, dialogueId: string): void {
  if (player.dimension.getEntities({
    type: 'r4isen1920_originspe:dialogue_handler',
    location: player.location,
    maxDistance: 32
  }).length === 0) {
    const spawnLocation = { x: player.location.x, y: player.location.y + 1, z: player.location.z };
    player.dimension.spawnEntity('r4isen1920_originspe:dialogue_handler', spawnLocation);
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
 * @param player 
 * @param set 
 * @param viewType 
 */
export function openScreenPickerGUI(player: Player, set: 'race' | 'class' = 'race', viewType: 'pick' | 'change' | 'view' | 'viewonly' = 'pick'): void {
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
 * Retrieves or initializes the scoreboard
 * value for a given options toggle.
 * 
 * @param toggleName 
 * @returns 
 */
export function getToggleValue(toggleName: 'orb' | 'paper' | 'unique' | 'announce'): number {
  let score = 0;
  try {
    score = _SCOREBOARD('index').getScore(`toggle_${toggleName}`) as number;
  } catch {
    _SCOREBOARD('index').setScore(`toggle_${toggleName}`, toggleName === 'unique' ? 0 : 1);
  }
  return _SCOREBOARD('index').getScore(`toggle_${toggleName}`) as number;
}

/**
 * 
 * Opens the options GUI for
 * the given player
 * 
 * @param player 
 * @param optionType 
 */
export function openOptionsGUI(player: Player, optionType: string): void {

  let dialogueId = '';

  switch (true) {

    case optionType === 'general':
      // Prevent opening if player is not on ground
      if (!player.isOnGround) {
        player.onScreenDisplay.setActionBar('You must be on the ground to open the General Options!');
        player.playSound('note.bass');
        return;
      }
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
      dialogueId = `gui_options_admin_toggle_root_${getToggleValue('orb')}${getToggleValue('paper')}${getToggleValue('unique')}${getToggleValue('announce')}`;
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
 * @param player 
 * @returns 
 */
export function setPlayerGameMode(player: Player): string {

  const gameModes: [GameMode, string][] = [
    [GameMode.Adventure, 'adventure'],
    [GameMode.Creative, 'creative'],
    [GameMode.Spectator, 'spectator'],
    [GameMode.Survival, 'survival']
  ];
  const matchedEntry = gameModes.find(([mode]) => player.matches({ gameMode: mode }));
  const prevGamemode = matchedEntry ? matchedEntry[1] : 'survival';

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
 * @param player 
 */
function onCloseGUI(player: Player): void {
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
 * @param player 
 */
export function setupMenuItem(player: Player): void {

  const inventoryComponent = player.getComponent('inventory')?.container as Container | undefined;
  if (inventoryComponent?.getItem(8)?.typeId !== 'r4isen1920_originspe:origins_menu') {

  const originsMenuItem = new ItemStack('r4isen1920_originspe:origins_menu');
    originsMenuItem.lockMode = ItemLockMode.slot;
    originsMenuItem.keepOnDeath = true;
    inventoryComponent?.setItem(8, originsMenuItem);

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

  const player = sourceEntity as Player;
  const playerOrigin = player.getTags().find(tag => tag.startsWith(`race_`));
  const playerClass = player.getTags().find(tag => tag.startsWith(`class_`));

  switch (message) {
    case 'open_screen_picker_race':
      if (!playerOrigin) openScreenPickerGUI(player, 'race');
      else onCloseGUI(player)
      break;
    case 'open_screen_picker_class':
      if (!playerClass) openScreenPickerGUI(player, 'class');
      else onCloseGUI(player)
      break;
    case 'on_close': 
      onCloseGUI(player)
      break;

    case 'open_options_general':
      openOptionsGUI(player, 'general')
      break;
    case 'open_options_view_origin':
      openOptionsGUI(player, 'view_origin')
      break;
    case 'open_options_view_class':
      openOptionsGUI(player, 'view_class')
      break;
    case 'open_options_admin':
      openOptionsGUI(player, 'admin')
      break;
    case 'open_options_admin_toggle':
      openOptionsGUI(player, 'admin_toggle')
      break;

    default:
      console.warn(`[r4isen1920][OriginsPE] Unknown GUI request: ${message}`);
      break;
  }

}, { namespaces: [ 'r4isen1920_originspe' ] })
