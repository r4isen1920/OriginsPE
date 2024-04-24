
import { world, system, TicksPerSecond, EquipmentSlot, GameMode } from "@minecraft/server";

import { toAllPlayers } from "../../../origins/player";
import { getEquipment } from "../../../utils/items";

const oreBlocks = [
  'ancient_debris',
  'coal_ore',
  'copper_ore',
  'deepslate_coal_ore',
  'deepslate_diamond_ore',
  'deepslate_emerald_ore',
  'deepslate_gold_ore',
  'deepslate_iron_ore',
  'deepslate_lapis_ore',
  'deepslate_redstone_ore',
  'lit_deepslate_redstone_ore',
  'diamond_ore',
  'emerald_ore',
  'gold_ore',
  'iron_ore',
  'lapis_ore',
  'nether_gold_ore',
  'quartz_ore',
  'redstone_ore',
  'lit_redstone_ore',
]

export const directions = [
  'north', 'south', 'west', 'east', 'above', 'below'
]

system.runTimeout(() => {

  world.afterEvents.playerBreakBlock.subscribe(
    event => {

      const { block, brokenBlockPermutation, player } = event;
      if (
        !player.hasTag('perk_ore_vein_miner') ||
        player.matches({ gameMode: GameMode.creative }) ||
        !getEquipment(player, EquipmentSlot.Mainhand).typeId.includes('_pickaxe')
      ) return;

      const oreBlock = oreBlocks.find(ore => brokenBlockPermutation.matches(`minecraft:${ore}`));
      if (!oreBlock) return;

      directions.forEach(direction => {
        const newVeinMinerEntity = player.dimension.spawnEntity('r4isen1920_originspe:vein_miner', block[direction]().center())

        newVeinMinerEntity.setDynamicProperty('r4isen1920_originspe:targetBlock', oreBlock);
        newVeinMinerEntity.setDynamicProperty('r4isen1920_originspe:originator', player.id);
        newVeinMinerEntity.setDynamicProperty('r4isen1920_originspe:iteration', 0);
      })

    }
  )

}, TicksPerSecond * 6)

/**
 * 
 * Ticks vein miner entities
 * throughout the world
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function ore_vein_miner(player) {
  if (
    !player.hasTag('perk_ore_vein_miner') &&
    !player.hasTag('perk_tree_felling')
  ) return;

  player.dimension.getEntities({
    location: player.location,
    maxDistance: 48,
    type: 'r4isen1920_originspe:vein_miner'
  })?.forEach(veinMinerEntity => {

    const currentBlock = veinMinerEntity.dimension.getBlock(veinMinerEntity.location);

    if (veinMinerEntity.getDynamicProperty('r4isen1920_originspe:iteration') > 27) {
      veinMinerEntity.remove();
      return;
    }

    if (currentBlock?.permutation.matches(veinMinerEntity.getDynamicProperty('r4isen1920_originspe:targetBlock'))) {
      directions.forEach(direction => {
        const newVeinMinerEntity = player.dimension.spawnEntity('r4isen1920_originspe:vein_miner', currentBlock[direction]().center())

        newVeinMinerEntity.setDynamicProperty('r4isen1920_originspe:targetBlock', veinMinerEntity.getDynamicProperty('r4isen1920_originspe:targetBlock'));
        newVeinMinerEntity.setDynamicProperty('r4isen1920_originspe:originator', veinMinerEntity.getDynamicProperty('r4isen1920_originspe:originator'));
        newVeinMinerEntity.setDynamicProperty('r4isen1920_originspe:iteration', veinMinerEntity.getDynamicProperty('r4isen1920_originspe:iteration') + 1);
      })

      veinMinerEntity.runCommand('setblock ~~~ air [] destroy');
      player.dimension.spawnParticle(`r4isen1920_originspe:vein_mine`, currentBlock.center());

      //* Teleport items to originator
      currentBlock.dimension.getEntities({
        location: currentBlock.location,
        maxDistance: 5,
        type: 'minecraft:item',
      }).forEach(itemEntity => {
        if (itemEntity.getComponent('item')?.itemStack.typeId.includes(veinMinerEntity.getDynamicProperty('r4isen1920_originspe:targetBlock').replace('_ore', ''))) {
          itemEntity.teleport(world.getEntity(veinMinerEntity.getDynamicProperty('r4isen1920_originspe:originator'))?.location);
        }
      })

    }

    veinMinerEntity.remove();

  })

}

toAllPlayers(ore_vein_miner, 2)
