//no_shield.ts
import { EquipmentSlot, Player } from "@minecraft/server";

import { toAllPlayers } from "../../../origins/player";
import { Vector3 } from "../../../utils/Vec3";


function no_shield(player: Player): void {
  if (!player.hasTag("power_no_shield") || !player.isSneaking) return;

  const playerEquipment = function (
    slot: EquipmentSlot,
  ): import("@minecraft/server").ItemStack | null {
    return player.getComponent("equippable")?.getEquipment(slot) ?? null;
  };

  switch (true) {
    case playerEquipment(EquipmentSlot.Offhand)?.typeId === "minecraft:shield":
      player
        .getComponent("equippable")
        ?.setEquipment(EquipmentSlot.Offhand, undefined);
      onShieldBroken(player);
      break;

    case playerEquipment(EquipmentSlot.Mainhand)?.typeId === "minecraft:shield":
      player
        .getComponent("equippable")
        ?.setEquipment(EquipmentSlot.Mainhand, undefined);
      onShieldBroken(player);
      break;
  }
}

toAllPlayers(no_shield, 1);

function onShieldBroken(player: Player): void {
  player.playSound("random.break", { location: player.location });
  player.dimension.spawnParticle(
    "r4isen1920_originspe:shield_break",
    Vector3.add(player.location, new Vector3(0, 0.5, 0)),
  );
}
