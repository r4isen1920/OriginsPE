import { system, world } from "@minecraft/server";
import { toAllPlayers } from "../../../origins/player";
import { Vector3 } from "../../../utils/Vec3";
import { removeTags } from "../../../utils/tags";

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function master_of_webs(player) {

  /**
   * @param { number } yPos 
   * @returns { import('@minecraft/server').Block | undefined }
   */
  const block = function(yPos) {
    return player.dimension.getBlock(Vector3.add(player.location, new Vector3(0, yPos, 0)))
  }

  player.runCommand(
    'fill ~10 ~10 ~10 ~-10 ~-10 ~-10 r4isen1920_originspe:fake_cobweb replace web'
  )
  player.runCommand('clear @s r4isen1920_originspe:fake_cobweb')


  if (player.hasTag('race_arachnid')) return;

  if (block(0)?.permutation.matches('r4isen1920_originspe:fake_cobweb') || block(1)?.permutation.matches('r4isen1920_originspe:fake_cobweb')) {
      player.addEffect('minecraft:slowness', 100, { amplifier: 2, showParticles:false });

    if (block(0)?.permutation.matches('r4isen1920_originspe:fake_cobweb') && block(1)?.permutation.matches('r4isen1920_originspe:fake_cobweb')) {
      player.addTag('_master_of_webs_1')
      player.removeTag('_master_of_webs_0')
      
    } else {
      player.addTag('_master_of_webs_0')
      player.removeTag('_master_of_webs_1')
    }
        

  } else {
    removeTags(player, '_master_of_webs');
    player.removeEffect('minecraft:slowness'); // Remove speed effect if not in a web
  }

}

system.runInterval(() => {
  world.getDimension('overworld').getEntities().forEach(entity => {
      master_of_webs(entity);
  });
});
