//pride.ts
import { toAllPlayers } from "../../../origins/player";
import { ResourceBar } from "../../../origins/resource_bar";
import { getEquipment, getItemsCountInInventory } from "../../../utils/items";
import { removeTags } from "../../../utils/tags";

import type { Player } from "@minecraft/server";

const goldItems = [
  {
    typeId: "minecraft:golden_helmet",
    value: 0.5,
  },
  {
    typeId: "minecraft:golden_chestplate",
    value: 0.7,
  },
  {
    typeId: "minecraft:golden_leggings",
    value: 0.7,
  },
  {
    typeId: "minecraft:golden_boots",
    value: 0.4,
  },
  {
    typeId: "minecraft:golden_sword",
    value: 0.2,
  },
  {
    typeId: "minecraft:golden_axe",
    value: 0.3,
  },
  {
    typeId: "minecraft:golden_pickaxe",
    value: 0.3,
  },
  {
    typeId: "minecraft:golden_shovel",
    value: 0.1,
  },
  {
    typeId: "minecraft:golden_hoe",
    value: 0.2,
  },
  {
    typeId: "minecraft:gold_block",
    value: 0.9,
  },
  {
    typeId: "minecraft:gold_ingot",
    value: 0.1,
  },
  {
    typeId: "minecraft:gold_nugget",
    value: 0.0111111111111111,
  },
];

const goldWearables = [
  {
    typeId: "minecraft:golden_helmet",
    value: 17.5,
  },
  {
    typeId: "minecraft:golden_chestplate",
    value: 17.5,
  },
  {
    typeId: "minecraft:golden_leggings",
    value: 17.5,
  },
  {
    typeId: "minecraft:golden_boots",
    value: 17.5,
  },
];

const normalize = function (value = 0, max = 70) {
  return (value / max) * 100;
};

function pride(player: Player): void {
  if (!player.hasTag("power_pride")) return;

  const inventoryItems = getItemsCountInInventory(player);
  const goldArmorTypes = goldWearables.map((item) => item.typeId);
  const goldArmorInInventory = inventoryItems.filter((item) =>
    goldArmorTypes.includes(item.typeId),
  );

  const goldItemsInInventory = inventoryItems.filter((item) =>
    goldItems.some((goldItem) => goldItem.typeId === item.typeId),
  );
  const totalGold = Math.min(
    goldItemsInInventory.reduce((total, item) => {
      const goldItem = goldItems.find(
        (goldItem) => goldItem.typeId === item.typeId,
      );
      return total + item.amount * (goldItem?.value ?? 0);
    }, 0),
    70,
  );

  interface GoldItem {
    typeId: string;
    value: number;
  }

  interface EquipmentItem {
    typeId: string;
    value: number;
  }

  const equipment = getEquipment(player);
  const equipmentArray = Array.isArray(equipment)
    ? equipment
    : equipment
      ? [equipment]
      : [];
  const wornEquipments: EquipmentItem[] = equipmentArray.map(
    (item: { typeId: string }) => ({
      typeId: item.typeId,
      value:
        goldWearables.find(
          (goldItem: GoldItem) => goldItem.typeId === item.typeId,
        )?.value || 0,
    }),
  );

  const prevValue = parseInt(
    player
      .getTags()
      ?.filter((tag) => tag?.startsWith("_dmg_reduce_value_"))[0]
      ?.split("_dmg_reduce_value_")[1],
  );
  const currentValue = Math.round(
    totalGold + wornEquipments.reduce((total, item) => total + item.value, 0),
  );

  if (prevValue === undefined) {
    player.addTag("_dmg_reduce_value_0");
    return;
  }

  if (!player.hasTag("_init_bar")) {
    new ResourceBar(
      15,
      normalize(currentValue, 70),
      normalize(currentValue, 70),
      1,
      true,
    ).push(player);

    player.addTag("_init_bar");
    return;
  }

  if (prevValue !== currentValue) {
    removeTags(player, "_dmg_reduce_value_");
    player.addTag("_dmg_reduce_value_" + currentValue);

    if (currentValue > 0) {
      new ResourceBar(
        15,
        normalize(prevValue, 70) || 0,
        normalize(currentValue, 70),
        1,
        true,
      ).push(player);
    } else {
      new ResourceBar(15, normalize(prevValue, 70) || 0, 0, 1).pop(player);
    }
  }
}

toAllPlayers(pride, 5);
