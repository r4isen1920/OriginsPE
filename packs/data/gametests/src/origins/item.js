
import { world } from "@minecraft/server";

import { openOptionsGUI, openScreenPickerGUI } from "./gui";
import { openAbilityHotbar, closeAbilityHotbar, getControlTags } from "./controls";


/**
 * 
 * Runs events for the player when they
 * use an item
 */
world.afterEvents.itemStartUse.subscribe(
  event => {

    const { itemStack, source } = event;

    switch (itemStack.typeId) {

      case 'r4isen1920_originspe:orb_of_origins':
        source.addTag('change_resign');
        openScreenPickerGUI(source, 'race', 'change');
        source.playSound('ui.wood_click');
        break;
      case 'r4isen1920_originspe:resignation_paper': 
        source.addTag('change_resign');
        openScreenPickerGUI(source, 'class', 'change');
        source.playSound('ui.wood_click');
        break;

      case 'r4isen1920_originspe:origins_menu':
        if (source.hasTag('controls_opened')) closeAbilityHotbar(source)
        else openAbilityHotbar(source);
        source.playSound('ui.wood_click');
        break;
      case 'r4isen1920_originspe:origins_submenu':
        closeAbilityHotbar(source);
        openOptionsGUI(source, 'general');
        source.playSound('ui.wood_click');
        break;

      default: break;

    }


    const playerControlTags = getControlTags(source);
    if (playerControlTags.length === 0) return;

    const controlTag = playerControlTags.find(tag => itemStack.typeId.includes(tag.replace('control_', '')));
    if (!controlTag) return;

    source.addTag(`_control_use_${controlTag.replace('control_', '')}`);
    closeAbilityHotbar(source);

  }
)
