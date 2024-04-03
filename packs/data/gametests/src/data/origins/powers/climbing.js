
import { toAllPlayers } from "../../../origins/player";
import { Vector3 } from "../../../utils/Vec3";

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function climbing(player) {

  const maxDistance = player.dimension.getBlock(Vector3.add(player.location, new Vector3(0, -1, 0))).isAir ? 2 : 1;

  const block = player.getBlockFromViewDirection({ maxDistance: maxDistance, includePassableBlocks: true, includeLiquidBlocks: false })?.block

  const IGNORED_BLOCKS = [
    'minecraft:cave_vines',
    'minecraft:cave_vines_body_with_berries',
    'minecraft:cave_vines_head_with_berries',
    'minecraft:ladder',
    'minecraft:red_flower',
    'minecraft:seagrass',
    'minecraft:scaffolding',
    'minecraft:tallgrass',
    'minecraft:vine',
    'minecraft:yellow_flower',
    'minecraft:weeping_vines'
  ]

  if (!block) return;

  if (
    !player.hasTag('power_climbing') ||
    IGNORED_BLOCKS.some(b => block.permutation.matches(b)) ||
    block.isAir ||
    !player.isJumping
  ) {
    player.removeTag('_climbing');
    return
  }

  player.applyKnockback(0, 0, 0, 0.5);
  player.addTag('_climbing')

}

toAllPlayers(climbing, 1)
