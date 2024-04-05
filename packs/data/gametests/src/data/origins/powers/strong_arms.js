
import { TicksPerSecond, system, world } from "@minecraft/server";

const ALLOWED_BLOCK_IDS = [
  'minecraft:stone',
  'minecraft:cobblestone',
  'minecraft:mossy_cobblestone',
]

system.runTimeout(() => {
  
  world.afterEvents.playerBreakBlock.subscribe(
    event => {
  
      const { block, brokenBlockPermutation, itemStackAfterBreak, itemStackBeforeBreak, player } = event;
  
      if (
        !player.hasTag('power_strong_arms') ||
        itemStackBeforeBreak?.typeId.includes('pickaxe') ||
        itemStackAfterBreak?.typeId.includes('pickaxe')
      ) return;

      if (!ALLOWED_BLOCK_IDS.some(id => brokenBlockPermutation.matches(id))) return;

      block.setPermutation(brokenBlockPermutation);
      player.runCommand(`setblock ${block.location.x} ${block.location.y} ${block.location.z} air [] destroy`);

    }
  )

}, TicksPerSecond * 1);
