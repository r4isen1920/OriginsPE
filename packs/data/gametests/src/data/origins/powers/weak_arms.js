
import { TicksPerSecond } from "@minecraft/server";
import { toAllPlayers } from "../../../origins/player";

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function weak_arms(player) {

  if (
    !player.hasTag('power_weak_arms') ||
    player.getEffect('strength')
  ) {
    player.removeEffect('weakness');
    player.removeEffect('mining_fatigue');

    return
  }

  const stoneTypes = [
    "minecraft:stone",
    "minecraft:cobblestone",
    "minecraft:andesite",
    "minecraft:diorite",
    "minecraft:granite",
    "minecraft:deepslate",
    "minecraft:tuff",
    "minecraft:calcite",
    "minecraft:dripstone_block"
  ];

   const block = player.getBlockFromViewDirection?.()?.block;

  player.addEffect('weakness', TicksPerSecond * 12, { amplifier: 0, showParticles: false });

  if (block && stoneTypes.includes(block.typeId)) {
  
  player.addEffect('mining_fatigue', TicksPerSecond * 12, { amplifier: 3, showParticles: false });
  } else {
    player.removeEffect('mining_fatigue');
  }
}

toAllPlayers(weak_arms, 2)
