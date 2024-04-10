
import { TicksPerSecond, system, world } from "@minecraft/server";

import { openOptionsGUI, openScreenPickerGUI } from "./gui";
import { openAbilityHotbar, closeAbilityHotbar, getControlTags } from "./controls";


/**
 * 
 * Subscribes to the event after
 * 6 seconds the server has initialized
 */
system.runTimeout(() => {

  /**
   * 
   * Checks when relevant items are
   * being used
   */
  world.afterEvents.itemStartUse.subscribe(
    event => {

      const { itemStack, source } = event;

      if (!itemStack.typeId.startsWith('r4isen1920_originspe:')) return;

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
          source.playSound('random.orb', { volume: 1, pitch: 0.5 });
          break;

        default: break;

      }


      if (!source.hasTag('controls_opened')) return;

      const playerControlTags = getControlTags(source);
      if (playerControlTags.length === 0) return;

      const controlTag = playerControlTags.find(tag => itemStack.typeId.includes(tag.replace('control_', '').replace('-hold', '')));
      if (!controlTag) return;

      switch (true) {

        case controlTag.includes('-hold'):
          source.addTag(`_control_hold_${controlTag.replace('control_', '').replace('-hold', '')}`);
          break;

        default:
          source.addTag(`_control_use_${controlTag.replace('control_', '')}`);
          closeAbilityHotbar(source);
          break;

      }
  
    }
  )

  /**
   * 
   * Checks when relevant items have been
   * stopped being used
   */
  world.afterEvents.itemStopUse.subscribe(
    event => {

      const { itemStack, source } = event;

      if (
        !itemStack?.typeId.startsWith('r4isen1920_originspe:origins_power.') &&
        !itemStack?.typeId.startsWith('r4isen1920_originspe:class_perk.')
      ) return;

      const playerControlTags = getControlTags(source);
      if (playerControlTags.length === 0) return;

      const controlTag = playerControlTags.find(tag => itemStack.typeId.includes(tag.replace('control_', '').replace('-hold', '')));
      if (!controlTag?.includes('-hold')) return;

      if (source.hasTag('controls_opened')) closeAbilityHotbar(source);
      source.removeTag(`_control_hold_${controlTag.replace('control_', '').replace('-hold', '')}`);

    }
  )

}, TicksPerSecond * 6)
