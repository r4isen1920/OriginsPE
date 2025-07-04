import { TicksPerSecond, EquipmentSlot, world, system, Player } from "@minecraft/server";
import { toAllPlayers } from "../../../origins/player";

const UNDERGROUND_BLOCKS = [
    "minecraft:stone",
    "minecraft:deepslate",
    "minecraft:iron_ore",
    "minecraft:coal_ore",
    "minecraft:diamond_ore",
    "minecraft:gold_ore",
    "minecraft:copper_ore",
    "minecraft:deepslate_iron_ore",
    "minecraft:deepslate_coal_ore",
    "minecraft:deepslate_diamond_ore",
    "minecraft:deepslate_gold_ore",
    "minecraft:deepslate_copper_ore",
    "minecraft:cobblestone",
    "minecraft:diorite",
    "minecraft:andesite",
    "minecraft:granite",
    "minecraft:dripstone_block"
];

const CLAW_DIGGABLE_BLOCKS = [
    "minecraft:dirt",
    "minecraft:gravel",
    "minecraft:sand",
    "minecraft:grass_block"
];

/**
 * @param {Player} player 
 * @returns 
 */
export function claw_digging(player) {
    if (!player.hasTag('power_claw_digging')) {
        player.removeEffect("minecraft:haste");
        return;
    }

    const heldItem = player.getComponent("equippable")?.getEquipment(EquipmentSlot.Mainhand);
    const targetBlock = (() => {
      let block;
      try {
         block = player.getBlockFromViewDirection()?.block;
      } catch { /** empty */ }
      return block;
    })();
    if (!targetBlock || !targetBlock.isValid()) return;
    const isUnderground = player.location.y < 40;

    // Apply effects when bare handed
    if (!heldItem || heldItem.typeId === "minecraft:air") {

        if (targetBlock && UNDERGROUND_BLOCKS.includes(targetBlock.typeId) && isUnderground) {
            player.addEffect("minecraft:haste", TicksPerSecond * 2, {
                amplifier: 15,
                showParticles: false
            });

        }
        else if (targetBlock && CLAW_DIGGABLE_BLOCKS.includes(targetBlock.typeId)) {
            player.addEffect("minecraft:haste", TicksPerSecond * 2, {
                amplifier: 3,
                showParticles: false
            });
        }
    } else {
        player.removeEffect("minecraft:haste");
    }
}

toAllPlayers(claw_digging, 1);


world.beforeEvents.playerBreakBlock.subscribe((event) => {
   const { player, block } = event;

   if (
      !player.hasTag('power_claw_digging') ||
      player.getGameMode() === 'creative'
   ) return;

   system.run(() => {
      const commandToRun = `setblock ${block.location.x} ${block.location.y} ${block.location.z} air destroy`;
      player.runCommand(commandToRun);
   })

   event.cancel = true;
});
