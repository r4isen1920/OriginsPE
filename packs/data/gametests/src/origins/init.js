
import { system, world } from "@minecraft/server";

import { openScreenPickerGUI, runDialogueCommand } from "./gui";
import { closeAbilityHotbar } from "./controls";
import { removeTags } from "../utils/tags";
import { initModules, resetPlayerAttributes } from "./player";
import { _SCOREBOARD } from "./resource_bar";


/**
 * 
 * Old build number
 */
const OLD_BUILDID = '000000';

/**
 * 
 * New build number
 */
const NEW_BUILDID = '12rqlf';


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

    _SCOREBOARD('gui').setScore(player, 0);

    player.removeTag('options_reset_player');
    player.removeTag('load_failed');
    removeTags(player, 'has_any_');
    removeTags(player, 'cooldown_');
    removeTags(player, '_');

    if (player.hasTag('controls_opened')) closeAbilityHotbar(player)

    const playerOrigin = player.getTags().find(tag => tag.startsWith(`race_`)) || false;
    const playerClass = player.getTags().find(tag => tag.startsWith(`class_`)) || false;
    if (!playerOrigin) openScreenPickerGUI(player, 'race');
    else if (!playerClass) openScreenPickerGUI(player, 'class');
    else {
      runDialogueCommand(player, 'gui_welcome_screen');

      resetPlayerAttributes(player);
      initModules(player);

      player.addTag('has_any_race');
      player.addTag('has_any_class');
    }
  }
)

/**
 * 
 * Runs the setup functions in
 * the world if not already
 */
function initialize() {

  const initType = world.scoreboard.getObjective(`originspe${OLD_BUILDID}`) !== undefined ? 'update_from_old_version' :
    world.scoreboard.getObjective(`originspe${NEW_BUILDID}`) !== undefined ? 'up_to_date' : 'register_new_world';

  let setupFunctions = [
    'r4isen1920_originspe/init',

    'r4isen1920_originspe/indexr',
    'r4isen1920_originspe/indexs',
    'r4isen1920_originspe/indexc',
  ];

  if (initType === 'update_from_old_version') {

    setupFunctions.unshift('r4isen1920_originspe/remove_legacy');
    try { world.scoreboard.removeObjective(`originspe${OLD_BUILDID}`) } catch {}

    console.warn(`[r4isen1920][OriginsPE] Updating Add-On version from build ${OLD_BUILDID} to ${NEW_BUILDID}`);

  } else if (initType === 'register_new_world') {

    try { world.scoreboard.addObjective(`originspe${NEW_BUILDID}`) } catch {}
    console.warn(`[r4isen1920][OriginsPE] Initializing Add-On on server running on build ${NEW_BUILDID}`);

  }

  if (initType === 'up_to_date') {
    console.warn(`[r4isen1920][OriginsPE] Loading Add-On running on build ${NEW_BUILDID}`);
    system.clearRun(_A);

    return
  };

  setupFunctions.forEach(functionName => {
    world.getDimension('overworld').runCommand(`function ${functionName}`)
  })

  system.clearRun(_A)

}
