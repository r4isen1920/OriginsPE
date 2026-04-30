
import { TicksPerSecond, Player } from "@minecraft/server";

import { toAllPlayers } from "../../../origins/player";
import { ResourceBar } from "../../../origins/resource_bar";


function high_jump(player: Player) {
  if (!player.hasTag('power_high_jump') || player.hasTag('cooldown_8')) return;

  const currentFragmentationLevel = parseInt(player.getTags().find(tag => tag.startsWith('fragmentation_level_'))?.replace('fragmentation_level_', '') ?? '0', 10);

  if (!player.hasTag('cooldown_7')) {
    if (!player.isSneaking) {
      player.addEffect('jump_boost', TicksPerSecond * 3, { amplifier: currentFragmentationLevel * 2 });
      if (player.isJumping && !player.hasTag('_high_jump_launched')) {
        player.addTag('_high_jump_launched');
        player.dimension.playSound('mob.slime.big', player.location, { volume: 1, pitch: 1 });
      }
    } else player.removeEffect('jump_boost');
  } 

  if (player.hasTag('_high_jump_launched') && player.isOnGround) {
    player.removeTag('_high_jump_launched');

    new ResourceBar(7, 0, 100, 5)
        .push(player);

    player.dimension.playSound('mob.slime.big', player.location);
    player.dimension.spawnEntity(`r4isen1920_originspe:knockback_roar<r4isen1920_originspe:knockback_targets.${currentFragmentationLevel}>`, player.location);
  }

}

toAllPlayers(high_jump, 2);
