//shulk_inventory.ts
import { toAllPlayers } from "../../../origins/player";
import { Vec3 } from "@bedrock-oss/bedrock-boost";
import { removeTags } from "../../../utils/tags";
import { system, world, Player } from "@minecraft/server";


function shulk_inventory(player: Player): void {
  if (!player.hasTag("power_shulk_inventory")) return;

  if (!player.hasTag("_shulk_inventory_open")) {
    player.dimension
      .getEntities({
        type: "r4isen1920_originspe:inventory_keep",
        tags: [`_inventory_keep_${player.id}`, "_inventory_keep_shulk"],
      })[0]
      ?.teleport(player.location, { dimension: player.dimension });
  }

  if (!player.hasTag("_control_use_shulk_inventory")) return;

  switch (true) {
    case player.hasTag("_shulk_inventory_open"):
      closeShulkInv(player);
      break;

    default:
      openShulkInv(player);
      break;
  }

  player.removeTag("_control_use_shulk_inventory");
}

toAllPlayers(shulk_inventory, 3);

function openShulkInv(player: Player): void {
  const dummyEntity =
    player.dimension.getEntities({
      type: "r4isen1920_originspe:inventory_keep",
      tags: [`_inventory_keep_${player.id}`, "_inventory_keep_shulk"],
    })[0] ||
    player.dimension.spawnEntity(
      "r4isen1920_originspe:inventory_keep",
      player.location,
    );

  dummyEntity.nameTag = "origins.shulk_inventory";
  dummyEntity.addTag(`_inventory_keep_${player.id}`);
  dummyEntity.addTag("_inventory_keep_shulk");

  player.runCommand(
    `ride @s start_riding @e[type=r4isen1920_originspe:inventory_keep,tag="_inventory_keep_${player.id}",tag="_inventory_keep_shulk",c=1] teleport_ride`,
  );

  player.onScreenDisplay.setTitle("origins.shulk_inventory");
  player.playSound("random.enderchestopen");
  player.dimension.spawnParticle(
    "r4isen1920_originspe:shulk_inventory",
    Vec3.from(player.location).add(Vec3.from(0, 1.5, 0)),
  );

  player.addTag("_shulk_inventory_open");
  player.triggerEvent("r4isen1920_originspe:is_riding_dummy.true");
}

function closeShulkInv(player: Player): void {
  player.runCommand("ride @s stop_riding");

  player.onScreenDisplay.setTitle("origins.player_inventory");
  player.playSound("random.enderchestclosed");
  player.dimension.spawnParticle(
    "r4isen1920_originspe:player_inventory",
    Vec3.from(player.location).add(Vec3.from(0, 1.5, 0)),
  );

  removeTags(player, "_shulk_inventory");
  player.triggerEvent("r4isen1920_originspe:is_riding_dummy.false");
}

system.runInterval(() => {
  for (const player of world.getPlayers()) {
    if (!player.hasTag("_shulk_inventory_open")) continue;

    const velocity = player.getVelocity?.();
    const isMoving =
      velocity && (Math.abs(velocity.x) > 0.01 || Math.abs(velocity.z) > 0.01);
    const isJumping = velocity && velocity.y > 0.1;

    if (isMoving || isJumping) {
      closeShulkInv(player);
    }
  }
}, 1);
