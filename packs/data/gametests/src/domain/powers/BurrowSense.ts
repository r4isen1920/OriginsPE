import { BlockVolume, Player, system, world, PlayerBreakBlockAfterEvent } from '@minecraft/server';
import { RegisterPower } from '../Registries';
import { Power } from '../Ability';
import { PlayerState } from '../../core/PlayerState';
import { PlayerTick } from '../../core/Ticker';


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

    private static breakHandler: ((ev: PlayerBreakBlockAfterEvent) => void) | undefined;
    private static refCount = 0;

    onAcquire(_player: Player): void {
        BurrowSense.refCount++;
        if (BurrowSense.refCount === 1) {
            BurrowSense.breakHandler = (ev) => BurrowSense.onBlockBreak(ev);
            world.afterEvents.playerBreakBlock.subscribe(BurrowSense.breakHandler);
        }
    }

    onRelease(_player: Player): void {
        BurrowSense.refCount = Math.max(0, BurrowSense.refCount - 1);
        if (BurrowSense.refCount === 0 && BurrowSense.breakHandler) {
            world.afterEvents.playerBreakBlock.unsubscribe(BurrowSense.breakHandler);
            BurrowSense.breakHandler = undefined;
        }
    }

    onActivate(player: Player): void {
        const oreLocations = findNearbyOres(player);
        if (oreLocations.length > 0) {
            createOreHighlights(player, oreLocations);
        }
    }

    private static onBlockBreak(ev: PlayerBreakBlockAfterEvent): void {
        const { block, brokenBlockPermutation, dimension, player } = ev;

        if (!PlayerState.for(player).hasPower('burrow_sense')) return;
        if (!SUPPORTED_ORES.has(brokenBlockPermutation.type.id)) return;

        const entity = dimension
            .getEntitiesAtBlockLocation(block.location)
            .find(e => e.typeId === HIGHLIGHT_ENTITY);

        if (entity) entity.remove();
    }
}