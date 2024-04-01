
import { GameMode, world, system } from "@minecraft/server";

import { Vector3 } from "../utils/Vec3";
import { removeTags } from "../utils/tags";


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
  player.addTag(`was_${setPlayerGameMode(player)}`)

  const _A = system.runInterval(() => {
    player.runCommand(`dialogue open @e[type=r4isen1920_originspe:dialogue_handler,c=1] @s ${dialogueId}`);
    if (world.scoreboard.getObjective('guib').getScore(player) === 1) system.clearRun(_A);
  }, 4)
}

/**
 * 
 * Opens the screen picker
 * GUI for the given player
 * 
 * @param { import('@minecraft/server').Player } player 
 * @param { 'race' | 'class' } set 
 * @param { 'pick' | 'change' | 'view' } viewtype 
 */
export function openScreenPickerGUI(player, set='race', viewtype='pick') {
  const playerOrigin = player.getTags().find(tag => tag.startsWith(`${set}_`))?.replace(`${set}_`, '');
  const dialogueId = playerOrigin ? `gui_${set}_${viewtype}_${playerOrigin}` : `gui_${set}_${viewtype}_${set === 'race' ? 'human' : 'nitwit'}`;

  console.warn(`open GUI: ${dialogueId}`)

  runDialogueCommand(player, dialogueId)
}

/**
 * 
 * Turns the player into survival mode
 * for on_close and on_open commands processing
 * and returns the gamemode it was on
 * 
 * @param { import('@minecraft/server').Player } player 
 * @returns { import('@minecraft/server').GameMode }
 */
function setPlayerGameMode(player) {

  const gameModes = [
    'adventure',
    'creative',
    'spectator',
    'survival'
  ]

  const prevGamemode = gameModes.find(gamemode => player.matches({ gameMode: gamemode }))

  player.runCommand('gamemode survival')

  return prevGamemode

}

/**
 * 
 * Runs when the GUI is closed
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function onCloseGUI(player) {
  const prevGamemode = player.getTags().find(tag => tag.startsWith('was_'))
  if (prevGamemode) {
    player.runCommand(`gamemode ${prevGamemode.replace('was_', '')}`)
    player.removeTag(`was_${prevGamemode}`)
  }
}

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

    default:
      console.warn(`[r4isen1920][OriginsPE] Unknown GUI request: ${message}`);
      break;
  }

})
