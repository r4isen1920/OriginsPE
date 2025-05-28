import { TicksPerSecond, world } from "@minecraft/server";
import { toAllPlayers } from "../../../origins/player";
import { _SCOREBOARD, ResourceBar } from "../../../origins/resource_bar";
import { Vector3 } from "../../../utils/Vec3";

/**
 * @param { import('@minecraft/server').Player } player 
 */
function tunnel_leap(player) {
  if (
    !player.hasTag('power_tunnel_leap') ||
    !player.hasTag('_control_use_tunnel_leap')
  ) return

  const stressProperty = 'r4isen1920_originspe:stress';
  const currentStressValue = player.getDynamicProperty(stressProperty) || 0;
  if (!currentStressValue) player.setDynamicProperty(stressProperty, 0);

  if (
    player.hasTag('cooldown_23') &&
    (_SCOREBOARD('cd2').getScore(player) === 0 || _SCOREBOARD('cd2').getScore(player) !== 23) &&
    (_SCOREBOARD('cd3').getScore(player) === 0 || _SCOREBOARD('cd3').getScore(player) !== 23)
  ) player.removeTag('cooldown_23');

  if (!player.hasTag('cooldown_23')) {
    player.addTag('cooldown_23');

    // Configuration variables
    const MAX_TUNNEL_DISTANCE = 8;  // Increased tunnel distance
    const tunnelWidth = 1;  // Increased tunnel width
    const tunnelHeight = 1; // Added tunnel height
    
    // Get player's view direction and create tunnel effect
    const viewDir = player.getViewDirection();
    
    // Create tunnel effect by removing blocks
    for(let i = 0; i <= MAX_TUNNEL_DISTANCE; i++) {
      const pos = Vector3.add(player.location, new Vector3(
        viewDir.x * i,
        viewDir.y * i,
        viewDir.z * i
      ));

      // Get and break breakable blocks
      for(let x = -tunnelWidth; x <= tunnelWidth; x++) {
        for(let y = -1; y <= tunnelHeight; y++) {  // Modified height range
          for(let z = -tunnelWidth; z <= tunnelWidth; z++) {
            const blockPos = Vector3.add(pos, new Vector3(x, y, z));
            const block = player.dimension.getBlock(blockPos);
            
            // Expanded list of breakable blocks
            if (block && (
              block.typeId === 'minecraft:dirt' ||
              block.typeId === 'minecraft:grass' ||
              block.typeId === 'minecraft:coarse_dirt' ||
              block.typeId === 'minecraft:rooted_dirt' ||
              block.typeId === 'minecraft:grass_block' ||
              block.typeId === 'minecraft:dirt_with_roots' ||
              block.typeId === 'minecraft:farmland' ||
              block.typeId === 'minecraft:mycelium'
            )) {
              block.setType('minecraft:air');
              player.dimension.spawnParticle('minecraft:explosion_particle', blockPos);
            }
          }
        }
      }
    }

    // Launch player forward with consistent speed
    player.applyKnockback(
      viewDir.x,
      viewDir.z,
      10,
      0  // Set vertical component to 0 to prevent faster upward movement
    );

    // Effects and cooldown
    player.dimension.spawnParticle('minecraft:large_explosion', Vector3.add(player.location, new Vector3(0, 0.5, 0)));
    world.playSound('random.explode', player.location);
    player.playSound('random.explode');

    // Set cooldown texture
    _SCOREBOARD('cd2').setScore(player, 23);
    _SCOREBOARD('cd3').setScore(player, 23);

    new ResourceBar(23, 0, 100, currentStressValue > 70 ? 1 : 3)
        .push(player);

  } else {
    player.playSound('note.bass', { volume: 1, pitch: 1.5 });
  }

  player.removeTag('_control_use_tunnel_leap');
}

toAllPlayers(tunnel_leap, 2)