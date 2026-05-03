import { toAllPlayers } from "../../../origins/player";
import { Vector3 } from "../../../utils/Vec3";
import { Player, world, EntityDamageCause } from "@minecraft/server";

function climbing(player: Player) {
  const blockBelow = player.dimension.getBlock(
    Vector3.add(player.location, new Vector3(0, -1, 0)),
  );
  const maxDistance = blockBelow?.isAir ? 2 : 1;

  const block = player.getBlockFromViewDirection({
    maxDistance: maxDistance,
    includePassableBlocks: true,
    includeLiquidBlocks: false,
  })?.block;

  const IGNORED_BLOCKS = [
    "minecraft:cave_vines",
    "minecraft:cave_vines_body_with_berries",
    "minecraft:cave_vines_head_with_berries",
    "minecraft:ladder",
    "minecraft:red_flower",
    "minecraft:seagrass",
    "minecraft:scaffolding",
    "minecraft:tallgrass",
    "minecraft:vine",
    "minecraft:yellow_flower",
    "minecraft:weeping_vines",
  ];

  if (!block) return;

  if (
    !player.hasTag("power_climbing") ||
    IGNORED_BLOCKS.some((b) => block.permutation.matches(b)) ||
    block.isAir ||
    !player.isJumping
  ) {
    player.removeTag("_climbing");
    return;
  }

  player.applyImpulse(new Vector3(0, 0.15, 0));
  player.addTag("_climbing");
}

toAllPlayers(climbing, 1);

world.beforeEvents.entityHurt.subscribe((event) => {
  const { damageSource, hurtEntity } = event;

  if (
    hurtEntity.typeId !== "minecraft:player" ||
    !hurtEntity.hasTag("_climbing") ||
    damageSource.cause !== EntityDamageCause.fall
  ) {
    return;
  }

  event.damage = event.damage * 0.25;
});
