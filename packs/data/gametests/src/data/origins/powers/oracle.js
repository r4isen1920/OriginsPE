
import { world, system, TicksPerSecond } from "@minecraft/server";

import { findPlayersWithSameID } from "./prescience";

system.runTimeout(() => {

  world.afterEvents.entityHealthChanged.subscribe(
    event => {

      const { entity, newValue, oldValue } = event;
      if (
        entity.typeId !== 'minecraft:player' ||
        !entity.hasTag('power_oracle') ||
        !entity.hasTag('_under_prescience')
      ) return

      const healthDiff = Math.floor(newValue - oldValue)
      if (Math.abs(healthDiff) < 2) return

      const allPlayerTags = findPlayersWithSameID(entity.id).filter(player => !player.hasTag('power_oracle'))
      if (allPlayerTags.length === 0) return

      allPlayerTags.forEach(player => {

        /**
         * @type { import('@minecraft/server').EntityHealthComponent }
         */
        const playerHealth = player.getComponent('health')
        playerHealth.setCurrentValue(Math.clamp(playerHealth.currentValue + healthDiff, 1, playerHealth.effectiveMax))

      })

    }
  )

}, TicksPerSecond * 7)
