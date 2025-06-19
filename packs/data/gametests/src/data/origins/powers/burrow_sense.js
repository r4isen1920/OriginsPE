import { BlockVolume, Player, world } from "@minecraft/server";
import { toAllPlayers } from "../../../origins/player";



//#region Configs
const SUPPORTED_ORES = [
   "minecraft:coal_ore",
   "minecraft:iron_ore",
   "minecraft:gold_ore",
   "minecraft:diamond_ore",
   "minecraft:deepslate_coal_ore",
   "minecraft:deepslate_iron_ore",
   "minecraft:deepslate_gold_ore",
   "minecraft:deepslate_diamond_ore",
   "minecraft:copper_ore",
   "minecraft:emerald_ore",
   "minecraft:lapis_ore",
   "minecraft:redstone_ore",
   "minecraft:deepslate_copper_ore",
   "minecraft:deepslate_emerald_ore",
   "minecraft:deepslate_lapis_ore",
   "minecraft:deepslate_redstone_ore",
   "minecraft:nether_gold_ore",
   "minecraft:quartz_ore",
];

const SCAN_RADIUS = 8;
const HIGHLIGHT_ENTITY = "r4isen1920_originspe:ore_highlight";



//#region burrowSense
/**
 * Burrow sense power - Detects nearby ores and highlights them
 * @param {Player} player - The player to check for the power
 */
export function burrow_sense(player) {
   if (
      !player.hasTag("power_burrow_sense") ||
      !player.hasTag("_control_use_burrow_sense")
   ) {
      return;
   }

   const oreLocations = findNearbyOres(player);

   if (oreLocations.length > 0) {
      createOreHighlights(player, oreLocations);
   }

   player.removeTag("_control_use_burrow_sense");
}



//#region findNearbyOres
/**
 * Finds all ore blocks within scan radius of the player
 * @param {Player} player - The player to scan around
 * @returns {Vector3[]} - Array of ore block center positions
 */
function findNearbyOres(player) {
   const playerLoc = player.location;
   const dimension = player.dimension;
   const foundOres = [];

   const blockVolume = new BlockVolume(
      { x: playerLoc.x - SCAN_RADIUS, y: playerLoc.y - SCAN_RADIUS, z: playerLoc.z - SCAN_RADIUS },
      { x: playerLoc.x + SCAN_RADIUS, y: playerLoc.y + SCAN_RADIUS, z: playerLoc.z + SCAN_RADIUS }
   );
   const oresInVolume = dimension
      .getBlocks(blockVolume, { includeTypes: SUPPORTED_ORES }, false)
      .getBlockLocationIterator();

   for (const oreLoc of oresInVolume) {
      foundOres.push(oreLoc);
   }

   return foundOres;
}



//#region createOreHighlights
/**
 * Creates highlight entities for the found ores
 * @param {Player} player - The player who will see the highlights
 * @param {Vector3[]} oreLocations - Array of ore positions to highlight
 */
function createOreHighlights(player, oreLocations) {
   const dimension = player.dimension;

   for (const oreLoc of oreLocations) {
      const entity = dimension.spawnEntity(HIGHLIGHT_ENTITY, {
         x: Math.floor(oreLoc.x) + 0.5,
         y: Math.floor(oreLoc.y),
         z: Math.floor(oreLoc.z) + 0.5,
      });

      world.sendMessage(entity.id);

      entity.playAnimation(
         'size.0',
         {
            nextState: '0',
            blendOutTime: 0.0,
            stopExpression: '!q.is_alive'
         }
      );
   }
}



// Remove highlights when a block is broken
world.afterEvents.playerBreakBlock.subscribe((event) => {
   const blockLoc = event.block.location;
   const brokenBlockPermutation = event.brokenBlockPermutation;
   const dimension = event.dimension;
   const player = event.player;

   if (
      !player.hasTag('power_burrow_sense') ||
      !SUPPORTED_ORES.includes(brokenBlockPermutation.type.id)
   ) return;

   const entity = dimension
      .getEntitiesAtBlockLocation(blockLoc)
      .find((e) => e.typeId === HIGHLIGHT_ENTITY);

   if (entity) {
      entity.remove();
   }
});

// Register the power to run for all players
toAllPlayers(burrow_sense, 3);
