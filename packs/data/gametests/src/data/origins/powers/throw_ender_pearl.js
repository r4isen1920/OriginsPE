
import { Direction, world } from "@minecraft/server";

import { toAllPlayers } from "../../../origins/player";
import { ResourceBar } from "../../../origins/resource_bar";

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function throw_ender_pearl(player) {
  if (
    !player.hasTag('power_throw_ender_pearl') ||
    !player.hasTag('_control_use_throw_ender_pearl')
  ) return


  if (!player.hasTag('cooldown_3')) {

    const targetBlock = player.getBlockFromViewDirection()
    if (!targetBlock) {
      player.removeTag('_control_use_throw_ender_pearl');
      player.playSound('note.bass', { volume: 1, pitch: 1.5 });
      return
    }

    let targetLocation;
    const locationMap = {
      [Direction.Down]: targetBlock.block.below().location,
      [Direction.East]: targetBlock.block.east().location,
      [Direction.North]: targetBlock.block.north().location,
      [Direction.South]: targetBlock.block.south().location,
      [Direction.Up]: targetBlock.block.above().location,
      [Direction.West]: targetBlock.block.west().location,
    };

    targetLocation = locationMap[targetBlock.face] || targetBlock.block.location;

    world.playSound('mob.endermen.portal', player.location);
    world.playSound('mob.endermen.portal', targetLocation);

    player.teleport(targetLocation, { dimension: targetBlock.block.dimension })

    player.onScreenDisplay.setActionBar('origins.purple_blink');

    new ResourceBar(3, 0, 100, 15)
        .push(player)

  } else {

    player.playSound('note.bass', { volume: 1, pitch: 1.5 })

  }

  player.removeTag('_control_use_throw_ender_pearl');

}

toAllPlayers(throw_ender_pearl, 2)
