
import { world } from "@minecraft/server";
import { openScreenPickerGUI } from "./gui";

world.afterEvents.itemStartUse.subscribe(
  event => {

    const { itemStack, source } = event;

    switch (itemStack.typeId) {

      case 'r4isen1920_originspe:orb_of_origins': 
        openScreenPickerGUI(source, 'race', 'change'); break

      case 'r4isen1920_originspe:resignation_paper': 
        openScreenPickerGUI(source, 'class', 'change'); break

      default: return

    }

  }
)
