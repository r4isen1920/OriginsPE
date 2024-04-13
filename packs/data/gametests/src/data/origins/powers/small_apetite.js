
import { world, system, TicksPerSecond } from "@minecraft/server";

import { ResourceBar } from "../../../origins/resource_bar";

system.runTimeout(() => {

  world.afterEvents.itemCompleteUse.subscribe(
    event => {
  
      const { itemStack, source } = event;
      if (!source.hasTag('power_small_apetite') || itemStack.typeId !== 'r4isen1920_originspe:inchling_sugar') return;
  
      source.addEffect('speed', TicksPerSecond * 12, { amplifier: 7 });
  
      new ResourceBar(12, 0, 100, 12)
          .push(source)
  
    }
  )

}, 4)
