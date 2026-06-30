import { BlockVolume, Player, system, PlayerBreakBlockAfterEvent } from '@minecraft/server';
import { RegisterPower } from '../../core/abilities/Registries';
import { Power } from '../../core/abilities/Ability';
import { PlayerState } from '../../core/platform/PlayerState';
import { PlayerTick } from '../../core/platform/Ticker';


const SUPPORTED_ORES = new Set([
    'minecraft:coal_ore',
    'minecraft:iron_ore',
    'minecraft:gold_ore',
    'minecraft:diamond_ore',
    'minecraft:deepslate_coal_ore',
    'minecraft:deepslate_iron_ore',
    'minecraft:deepslate_gold_ore',
    'minecraft:deepslate_diamond_ore',
    'minecraft:copper_ore',
    'minecraft:emerald_ore',
    'minecraft:lapis_ore',
    'minecraft:redstone_ore',
    'minecraft:deepslate_copper_ore',
    'minecraft:deepslate_emerald_ore',
    'minecraft:deepslate_lapis_ore',
    'minecraft:deepslate_redstone_ore',
    'minecraft:nether_gold_ore',
    'minecraft:quartz_ore',
]);

const SCAN_RADIUS = 8;
const HIGHLIGHT_ENTITY = 'r4isen1920_originspe:ore_highlight';


function findNearbyOres(player: Player) {
    const playerLoc = player.location;
    const dimension = player.dimension;
    const foundOres: { x: number; y: number; z: number }[] = [];

    const blockVolume = new BlockVolume(
        { x: playerLoc.x - SCAN_RADIUS, y: playerLoc.y - SCAN_RADIUS, z: playerLoc.z - SCAN_RADIUS },
        { x: playerLoc.x + SCAN_RADIUS, y: playerLoc.y + SCAN_RADIUS, z: playerLoc.z + SCAN_RADIUS },
    );

    const oresInVolume = dimension
        .getBlocks(blockVolume, { includeTypes: [...SUPPORTED_ORES] }, false)
        .getBlockLocationIterator();

    for (const oreLoc of oresInVolume) {
        foundOres.push(oreLoc);
    }

    return foundOres;
}

function createOreHighlights(player: Player, oreLocations: { x: number; y: number; z: number }[]): void {
    const dimension = player.dimension;
    const playerLocation = player.location;

    const sortedLoc = oreLocations.sort((a, b) => {
        const distA = Math.sqrt(
            Math.pow(a.x - playerLocation.x, 2) +
            Math.pow(a.y - playerLocation.y, 2) +
            Math.pow(a.z - playerLocation.z, 2),
        );
        const distB = Math.sqrt(
            Math.pow(b.x - playerLocation.x, 2) +
            Math.pow(b.y - playerLocation.y, 2) +
            Math.pow(b.z - playerLocation.z, 2),
        );
        return distA - distB;
    });

    sortedLoc.forEach((oreLoc, index) => {
        system.runTimeout(() => {
            const entity = dimension.spawnEntity(HIGHLIGHT_ENTITY, {
                x: Math.floor(oreLoc.x) + 0.5,
                y: Math.floor(oreLoc.y),
                z: Math.floor(oreLoc.z) + 0.5,
            });
            (player as any).setPropertyOverrideForEntity(entity, 'r4isen1920_originspe:is_visible', true);
        }, index + Math.floor(Math.random() * 5));
    });
}


/**
 * Detects nearby ores and highlights them when activated.
 */
@RegisterPower
export class BurrowSense implements Power {
    readonly id = 'burrow_sense';
    readonly icon = '22';

    readonly active = {
        icon: '22',
        name: 'origins.trait.burrow_sense.name',
        cooldownKey: 'burrow_sense_cooldown',
    };

    onActivate(player: Player): void {
        const oreLocations = findNearbyOres(player);
        if (oreLocations.length > 0) {
            createOreHighlights(player, oreLocations);
        }
    }

    onBreakBlock(_player: Player, ev: PlayerBreakBlockAfterEvent): void {
        const { block, brokenBlockPermutation, dimension } = ev;

        if (!SUPPORTED_ORES.has(brokenBlockPermutation.type.id)) return;

        const entity = dimension
            .getEntitiesAtBlockLocation(block.location)
            .find(e => e.typeId === HIGHLIGHT_ENTITY);

        if (entity) entity.remove();
    }
}