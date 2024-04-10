
import { ItemStack, system, TicksPerSecond, world } from "@minecraft/server";
import { toAllPlayers } from "../../../origins/player";
import { findItem } from "../../../utils/items";
import { changeFragementationLevel } from "./fragmentation";

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function slime_ball_consume(player) {

  let targetSlimeBall;
  let convertTo;

  if (player.hasTag('power_slime_ball_consume')) {
    targetSlimeBall = findItem(player, 'minecraft:slime_ball')
    convertTo = 'r4isen1920_originspe:slimecican_slime_ball'
  } else {
    targetSlimeBall = findItem(player, 'r4isen1920_originspe:slimecican_slime_ball')
    convertTo = 'minecraft:slime_ball'
  }

  if (!targetSlimeBall) return;

  player.getComponent('inventory').container.setItem(targetSlimeBall.slot, new ItemStack(convertTo, targetSlimeBall.item.amount))

}

toAllPlayers(slime_ball_consume, 3)

/**
 * 
 * Intercept requests if slime ball
 * item is being used
 */
system.runTimeout(() => {

  world.afterEvents.itemCompleteUse.subscribe(
    event => {
      const { itemStack, source } = event;
      if (itemStack.typeId !== 'r4isen1920_originspe:slimecican_slime_ball') return;

      switch (true) {

        default: return

        case source.hasTag('fragmentation_level_3'):
          changeFragementationLevel(source, 3)
          source.addEffect('regeneration', TicksPerSecond * 12, { amplifier: 0 })
          break

        case source.hasTag('fragmentation_level_2'):
          changeFragementationLevel(source, 3)
          break

        case source.hasTag('fragmentation_level_1'):
          changeFragementationLevel(source, 2)
          break

      }
    }
  )

}, TicksPerSecond * 4)