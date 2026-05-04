//ore_vein_miner.ts
import {
  world,
  system,
  TicksPerSecond,
  EquipmentSlot,
  GameMode,
  BlockPermutation,
  type ItemStack,
  type Player,
} from "@minecraft/server";

import { toAllPlayers } from "../../../origins/player";
import { getEquipment } from "../../../utils/items";

/**
 * 
 * Allows the player to mine connected ore blocks in a vein
 * 
 */

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

export const directions = [
  "north",
  "south",
  "west",
  "east",
  "above",
  "below",
] as const;

type Direction = (typeof directions)[number];

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

    directions.forEach((direction: Direction) => {
      const neighbor = block[direction]();
      if (!neighbor) return;
      const newVeinMinerEntity = player.dimension.spawnEntity(
        "r4isen1920_originspe:vein_miner",
        neighbor.center(),
      );

      newVeinMinerEntity.setDynamicProperty(
        "r4isen1920_originspe:targetBlock",
        oreBlock,
      );
      newVeinMinerEntity.setDynamicProperty(
        "r4isen1920_originspe:originator",
        player.id,
      );
      newVeinMinerEntity.setDynamicProperty(
        "r4isen1920_originspe:iteration",
        0,
      );
    });
  });
}, TicksPerSecond * 6);

/**
 *
 * Ticks vein miner entities
 * throughout the world
 *
 * @param player
 */
function ore_vein_miner(player: Player): void {
  if (
    !player.hasTag("perk_ore_vein_miner") &&
    !player.hasTag("perk_tree_felling")
  )
    return;

  player.dimension
    .getEntities({
      location: player.location,
      maxDistance: 48,
      type: "r4isen1920_originspe:vein_miner",
    })
    ?.forEach((veinMinerEntity) => {
      const currentBlock = veinMinerEntity.dimension.getBlock(
        veinMinerEntity.location,
      );

      const iteration = veinMinerEntity.getDynamicProperty(
        "r4isen1920_originspe:iteration",
      ) as number;

      if (iteration > 27) {
        veinMinerEntity.remove();
        return;
      }

      const targetBlock = veinMinerEntity.getDynamicProperty(
        "r4isen1920_originspe:targetBlock",
      ) as string;
      const originatorId = veinMinerEntity.getDynamicProperty(
        "r4isen1920_originspe:originator",
      ) as string;

      if (currentBlock?.permutation.matches(targetBlock)) {
        directions.forEach((direction: Direction) => {
          const neighbor = currentBlock[direction]();
          if (!neighbor) return;
          const newVeinMinerEntity = player.dimension.spawnEntity(
            "r4isen1920_originspe:vein_miner",
            neighbor.center(),
          );

          newVeinMinerEntity.setDynamicProperty(
            "r4isen1920_originspe:targetBlock",
            targetBlock,
          );
          newVeinMinerEntity.setDynamicProperty(
            "r4isen1920_originspe:originator",
            originatorId,
          );
          newVeinMinerEntity.setDynamicProperty(
            "r4isen1920_originspe:iteration",
            iteration + 1,
          );
        });

        currentBlock.setPermutation(BlockPermutation.resolve("minecraft:air"));
        player.dimension.spawnParticle(
          "r4isen1920_originspe:vein_mine",
          currentBlock.center(),
        );

        //* Teleport items to originator
        const originator = world.getEntity(originatorId);
        currentBlock.dimension
          .getEntities({
            location: currentBlock.location,
            maxDistance: 5,
            type: "minecraft:item",
          })
          .forEach((itemEntity) => {
            const itemStack = itemEntity.getComponent("item")?.itemStack;
            if (
              itemStack?.typeId.includes(targetBlock.replace("_ore", "")) &&
              originator
            ) {
              itemEntity.teleport(originator.location);
            }
          });
      }

      veinMinerEntity.remove();
    });
}

toAllPlayers(ore_vein_miner, 2);
