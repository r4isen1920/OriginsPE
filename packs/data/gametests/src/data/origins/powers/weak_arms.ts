//weak_arms.ts
import { TicksPerSecond, EquipmentSlot } from "@minecraft/server";
import { toAllPlayers } from "../../../origins/player";

import type { Player, ItemStack } from "@minecraft/server";

function hasEfficiency(item: ItemStack | undefined): boolean {
  if (!item) return false;
  try {
    const enchants: any = item.getComponent("enchantments");
    if (!enchants) return false;
    const efficiency = enchants.enchantments.getEnchantment(
      "minecraft:efficiency",
    );
    return efficiency && efficiency.level > 0;
  } catch {
    return false;
  }
}

function isTool(item: ItemStack | undefined): boolean {
  if (!item) return false;
  const id = item.typeId ?? "";
  return (
    id.includes("pickaxe") ||
    id.includes("shovel") ||
    id.includes("axe") ||
    id.includes("hoe")
  );
}

function weak_arms(player: Player): void {
  try {
    if (
      !player.hasTag("power_weak_arms") ||
      player.getEffect("minecraft:strength")
    ) {
      player.removeEffect("minecraft:weakness");
      player.removeEffect("minecraft:mining_fatigue");
      return;
    }

    const heldItem = player
      .getComponent("equippable")
      ?.getEquipment(EquipmentSlot.Mainhand);
    const y = Math.floor(player.location.y);

    if (!heldItem || !isTool(heldItem) || !hasEfficiency(heldItem)) {
      player.addEffect("minecraft:mining_fatigue", TicksPerSecond * 12, {
        amplifier: 0,
        showParticles: false,
      });
    } else {
      player.removeEffect("minecraft:mining_fatigue");
    }

    player.addEffect("minecraft:weakness", TicksPerSecond * 12, {
      amplifier: 0,
      showParticles: false,
    });
  } catch (e) {}
}

toAllPlayers(weak_arms, 2);
