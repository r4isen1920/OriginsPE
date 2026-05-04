import {
  world,
  system,
  TicksPerSecond,
  EquipmentSlot,
  GameMode,
  BlockPermutation,
  type ItemStack,
  Vector3,
} from "@minecraft/server";
import { getEquipment } from "../../../utils/items";

const oreBlocks: string[] = [
  "ancient_debris",
  "coal_ore",
  "copper_ore",
  "deepslate_coal_ore",
  "deepslate_diamond_ore",
  "deepslate_emerald_ore",
  "deepslate_gold_ore",
  "deepslate_iron_ore",
  "deepslate_lapis_ore",
  "deepslate_redstone_ore",
  "lit_deepslate_redstone_ore",
  "diamond_ore",
  "emerald_ore",
  "gold_ore",
  "iron_ore",
  "lapis_ore",
  "nether_gold_ore",
  "quartz_ore",
  "redstone_ore",
  "lit_redstone_ore",
];

const directions = [
  { x: 0, y: 1, z: 0 },
  { x: 0, y: -1, z: 0 },
  { x: 1, y: 0, z: 0 },
  { x: -1, y: 0, z: 0 },
  { x: 0, y: 0, z: 1 },
  { x: 0, y: 0, z: -1 },
];

interface VeinTask {
  location: Vector3;
  targetBlock: string;
  playerId: string;
  dimensionId: string;
  iteration: number;
}

let pendingBlocks: VeinTask[] = [];
const MAX_BLOCKS_PER_TICK = 5;

system.runTimeout(() => {
  world.afterEvents.playerBreakBlock.subscribe((event) => {
    const { block, brokenBlockPermutation, player } = event;
    const mainhand = getEquipment(player, EquipmentSlot.Mainhand) as
      | ItemStack
      | undefined;

    if (
      !player.hasTag("perk_ore_vein_miner") ||
      player.matches({ gameMode: GameMode.Creative }) ||
      !mainhand?.typeId.includes("_pickaxe")
    )
      return;

    const oreBlock = oreBlocks.find((ore) =>
      brokenBlockPermutation.matches(`minecraft:${ore}`),
    );
    if (!oreBlock) return;

    directions.forEach((dir) => {
      pendingBlocks.push({
        location: {
          x: block.x + dir.x,
          y: block.y + dir.y,
          z: block.z + dir.z,
        },
        targetBlock: `minecraft:${oreBlock}`,
        playerId: player.id,
        dimensionId: player.dimension.id,
        iteration: 0,
      });
    });
  });
}, TicksPerSecond * 6);

system.runInterval(() => {
  if (pendingBlocks.length === 0) return;

  const currentBatch = pendingBlocks.splice(0, MAX_BLOCKS_PER_TICK);

  for (const task of currentBatch) {
    if (task.iteration > 27) continue;

    const dimension = world.getDimension(task.dimensionId);
    const block = dimension.getBlock(task.location);
    const player = world.getEntity(task.playerId);

    if (block?.permutation.matches(task.targetBlock)) {
      block.setPermutation(BlockPermutation.resolve("minecraft:air"));
      dimension.spawnParticle("r4isen1920_originspe:vein_mine", {
        x: task.location.x + 0.5,
        y: task.location.y + 0.5,
        z: task.location.z + 0.5,
      });

      directions.forEach((dir) => {
        pendingBlocks.push({
          location: {
            x: task.location.x + dir.x,
            y: task.location.y + dir.y,
            z: task.location.z + dir.z,
          },
          targetBlock: task.targetBlock,
          playerId: task.playerId,
          dimensionId: task.dimensionId,
          iteration: task.iteration + 1,
        });
      });

      if (player) {
        dimension
          .getEntities({
            location: task.location,
            maxDistance: 2,
            type: "minecraft:item",
          })
          .forEach((item) => {
            if (
              item
                .getComponent("item")
                ?.itemStack.typeId.includes(
                  task.targetBlock
                    .replace("minecraft:", "")
                    .replace("_ore", ""),
                )
            ) {
              item.teleport(player.location);
            }
          });
      }
    }
  }
}, 1);
