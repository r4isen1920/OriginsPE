
import { BlockPermutation, world } from "@minecraft/server";

import { toAllPlayers } from "../../../origins/player";
import { ResourceBar } from "../../../origins/resource_bar";
import { changeStingerLevel } from "./sacrifice_stinger";

const flowerBlockIDs = [

  'minecraft:double_plant',
  'minecraft:pitcher_plant',
  'minecraft:red_flower',
  'minecraft:yellow_flower',
  'minecraft:torchflower',

  //* Non-existent -- to be added in an upcoming update, ignore for now:
  // 'minecraft:allium',
  // 'minecraft:azure_bluet',
  // 'minecraft:blue_orchid',
  // 'minecraft:cornflower',
  // 'minecraft:dandelion',
  // 'minecraft:lily_of_the_valley',
  // 'minecraft:oxeye_daisy',
  // 'minecraft:poppy',
  // 'minecraft:torchflower',
  // 'minecraft:orange_tulip',
  // 'minecraft:pink_tulip',
  // 'minecraft:red_tulip',
  // 'minecraft:white_tulip',
  // 'minecraft:wither_rose',

]

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function bloom(player) {
  if (!player.hasTag('power_bloom')) return;

  const currentStingerLevel = parseInt(player.getTags().filter(tag => tag.includes('stinger_level_'))[0].replace('stinger_level_', ''));
  if (currentStingerLevel >= 7) return;

  const blockOnStanding = player.dimension.getBlock(player.location);
  const isStandingOnFlower = flowerBlockIDs.some(id => blockOnStanding.permutation.matches(id)) && player.isSneaking;
  const isNightTime = world.getTimeOfDay() >= 12000 && world.getTimeOfDay() <= 22813;
  const cooldown = new ResourceBar(18, 0, 100, 5);

  if (isStandingOnFlower) player.dimension.spawnParticle('r4isen1920_originspe:bee_pollinate', blockOnStanding.center());

  if (!isStandingOnFlower) {
    if (player.hasTag('_bloom_on_stand') && player.hasTag('cooldown_18')) cooldown.pop(player);

    player.removeTag('_bloom_on_stand');
    player.removeTag('cooldown_18');
  }

  else if (player.hasTag('_bloom_on_stand') && !player.hasTag('cooldown_18')) {
    player.removeTag('_bloom_on_stand');

    changeStingerLevel(player, currentStingerLevel + 1);
    player.playSound('random.orb', { pitch: 1.5 });

    blockOnStanding.setPermutation(BlockPermutation.resolve('minecraft:air'));
    world.playSound('dig.grass', blockOnStanding.location);
  }

  else if (isStandingOnFlower && !isNightTime && !player.hasTag('cooldown_18')) {
    player.addTag('_bloom_on_stand');

    cooldown.push(player)
  }

}

toAllPlayers(bloom, 3)
