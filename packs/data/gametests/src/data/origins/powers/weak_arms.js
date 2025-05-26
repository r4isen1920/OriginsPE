import { TicksPerSecond, EquipmentSlot } from "@minecraft/server";
import { toAllPlayers } from "../../../origins/player";

/**
 * Checks if the item has the Efficiency enchantment.
 * @param {import('@minecraft/server').ItemStack | undefined} item
 * @returns {boolean}
 */
function hasEfficiency(item) {
  if (!item) return false;
  try {
    const enchants = item.getComponent("enchantments");
    if (!enchants) return false;
    const efficiency = enchants.enchantments.getEnchantment("minecraft:efficiency");
    return efficiency && efficiency.level > 0;
  } catch {
    return false;
  }
}

function isTool(item) {
  if (!item) return false;
  const id = item.typeId ?? "";
  return (
    id.includes("pickaxe") ||
    id.includes("shovel") ||
    id.includes("axe") ||
    id.includes("hoe")
  );
}

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function weak_arms(player) {
  try {
    if (
      !player.hasTag('power_weak_arms') ||
      player.getEffect("minecraft:strength")
    ) {
      player.removeEffect("minecraft:weakness");
      player.removeEffect("minecraft:mining_fatigue");
      return;
    }

    const heldItem = player.getComponent("equippable")?.getEquipment(EquipmentSlot.Mainhand);
    const y = Math.floor(player.location.y);

    
    if ((!heldItem || !isTool(heldItem) || !hasEfficiency(heldItem))) {
      player.addEffect("minecraft:mining_fatigue", TicksPerSecond * 12, { amplifier: 0, showParticles: false });
    } else {
      player.removeEffect("minecraft:mining_fatigue");
    }

    player.addEffect("minecraft:weakness", TicksPerSecond * 12, { amplifier: 0, showParticles: false });
  } catch (e) {
    // Ignore errors
  }
}

toAllPlayers(weak_arms, 2);
