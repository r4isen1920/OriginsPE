import {
  EquipmentSlot,
  ItemLockMode,
  ItemStack,
  ItemComponentTypes,
  TicksPerSecond,
} from "@minecraft/server";
import { toAllPlayers } from "../../../origins/player";

/**
 * Equips or removes an Elytra with custom lore and keeps it repaired.
 * @param {import('@minecraft/server').Player} player
 */
function elytra(player) {
  const equipment = player.getComponent("equippable");

  if (!equipment) return;

  const chestItem = equipment.getEquipment(EquipmentSlot.Chest);
  const hasElytraPower = player.hasTag("power_elytra");
  const isCustomElytra = chestItem?.getLore()?.includes("§r§6Elytrian§r");

  if (!hasElytraPower) {
    // Remove Elytra if equipped and it matches the custom one
    if (isCustomElytra) {
      equipment.setEquipment(EquipmentSlot.Chest, undefined);
    }
    return;
  }

  if (isCustomElytra) {
    // 🔁 Reset durability if custom elytra is already equipped
    const durability = chestItem.getComponent(ItemComponentTypes.Durability);
    if (durability && durability.damage > 0) {
      durability.damage = 0;
      equipment.setEquipment(EquipmentSlot.Chest, chestItem);
    }
    return;
  }

  // 🎯 Equip new Elytra if not present
  const newElytra = new ItemStack("minecraft:elytra");
  newElytra.lockMode = ItemLockMode.slot;
  newElytra.keepOnDeath = true;
  newElytra.setLore(["§r§6Elytrian§r"]);

  const durability = newElytra.getComponent(ItemComponentTypes.Durability);
  if (durability) durability.damage = 0;

  equipment.setEquipment(EquipmentSlot.Chest, newElytra);
}

toAllPlayers(elytra, TicksPerSecond * 5);