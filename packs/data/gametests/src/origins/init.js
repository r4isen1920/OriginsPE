
import { GameMode, system, world } from "@minecraft/server";

import { openScreenPickerGUI, runDialogueCommand } from "./gui";


/**
 * 
 * Begin initialization
 */
const _A = system.run(initialize)

/**
 * 
 * Initializes the player upon
 * joining the world
 */
world.afterEvents.playerSpawn.subscribe(
  event => {
    const { initialSpawn, player } = event;
    if (!initialSpawn) return

    world.scoreboard.getObjective('guib').setScore(player, 0)

    const playerOrigin = player.getTags().find(tag => tag.startsWith(`race_`)) || false;
    const playerClass = player.getTags().find(tag => tag.startsWith(`class_`)) || false;

    player.removeTag('load_failed')

    if (!playerOrigin) openScreenPickerGUI(player, 'race');
    else if (!playerClass) openScreenPickerGUI(player, 'class');
    else runDialogueCommand(player, 'gui_welcome_screen')
  }
)

/**
 * 
 * Runs the setup functions in
 * the world if not already
 */
function initialize() {

  const scoreboard = world.scoreboard.getObjective('index') || world.scoreboard.addObjective('index', 'index');
  if (scoreboard) return;

  const setupFunctions = [
    'r4isen1920_originspe/init',

    'r4isen1920_originspe/indexc',
    'r4isen1920_originspe/indexr',
    'r4isen1920_originspe/indexs'
  ]

  setupFunctions.forEach(functionName => {
    world.getDimension('overworld').runCommand(`function ${functionName}`)
  })

  system.clearRun(_A)

}
