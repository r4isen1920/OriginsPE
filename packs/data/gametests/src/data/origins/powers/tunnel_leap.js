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
    (_SCOREBOARD('cd2').getScore(player) <= 0 && _SCOREBOARD('cd3').getScore(player) <= 0)
  ) {
    player.removeTag('cooldown_23');
  }

  if (!player.hasTag('cooldown_23')) {
    player.addTag('cooldown_23');

    // Configuration variables
    const MAX_TUNNEL_DISTANCE = 8;
    const tunnelWidth = 1;  // Increased tunnel width
    const tunnelHeight = 1; // Added tunnel height
    
    // Get player's view direction and create tunnel effect
    const viewDir = player.getViewDirection();
    
    // Create normalized horizontal direction for tunnel
    const horizontalDir = new Vector3(
      viewDir.x,
      0, // Force vertical component to 0 for tunnel creation
      viewDir.z
    );
    
    // Create tunnel effect by removing blocks
    for(let i = 0; i <= MAX_TUNNEL_DISTANCE; i++) {
      const pos = Vector3.add(player.location, new Vector3(
        horizontalDir.x * i,
        0, // Keep tunnel at player's height level
        horizontalDir.z * i
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
              player.dimension.spawnParticle('minecraft:terrain_particle minecraft:dirt', blockPos);
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

    // Set cooldown scores
    const COOLDOWN_DURATION = 300; // 15 seconds at 20 ticks per second
    _SCOREBOARD('cd2').setScore(player, COOLDOWN_DURATION);
    _SCOREBOARD('cd3').setScore(player, COOLDOWN_DURATION);

    // Effects and cooldown
    player.dimension.spawnParticle('minecraft:terrain_particle minecraft:dirt', Vector3.add(player.location, new Vector3(0, 0.5, 0)));
    player.playSound('item.trident.riptide_1', { volume: 0.8, pitch: 1.0});

    // Fixed ResourceBar implementation
    new ResourceBar(
      23,           // id - must match the cooldown tag number
      0,          
      100,           
      10,           // duration in seconds (not ticks)
      false         // don't persist
    ).push(player);

  } else {
    player.playSound('note.bass', { volume: 1, pitch: 1.5 });
  }

  player.removeTag('_control_use_tunnel_leap');
}

// Make sure to reduce cooldown every tick
function reduceCooldown(player) {
  if (player.hasTag('cooldown_23')) {
    const cd2 = _SCOREBOARD('cd2').getScore(player);
    const cd3 = _SCOREBOARD('cd3').getScore(player);
    
    if (cd2 > 0) _SCOREBOARD('cd2').setScore(player, cd2 - 1);
    if (cd3 > 0) _SCOREBOARD('cd3').setScore(player, cd3 - 1);
  }
}

// Update the player function to include cooldown reduction
toAllPlayers((player) => {
  tunnel_leap(player);
  reduceCooldown(player);
}, 2);