import { EquipmentSlot, GameMode, Player, PlayerBreakBlockBeforeEvent, system, TicksPerSecond, world } from '@minecraft/server';
import { RegisterPower } from '../Registries';
import { Power } from '../Ability';
import { PlayerState } from '../../core/PlayerState';
import { PlayerTick } from '../../core/Ticker';


const UNDERGROUND_BLOCKS = new Set([
    'minecraft:stone',
    'minecraft:deepslate',
    'minecraft:iron_ore',
    'minecraft:coal_ore',
    'minecraft:diamond_ore',
    'minecraft:gold_ore',
    'minecraft:copper_ore',
    'minecraft:deepslate_iron_ore',
    'minecraft:deepslate_coal_ore',
    'minecraft:deepslate_diamond_ore',
    'minecraft:deepslate_gold_ore',
    'minecraft:deepslate_copper_ore',
    'minecraft:cobblestone',
    'minecraft:diorite',
    'minecraft:andesite',
    'minecraft:granite',
    'minecraft:dripstone_block',
]);

const CLAW_DIGGABLE_BLOCKS = new Set([
    'minecraft:dirt',
    'minecraft:gravel',
    'minecraft:sand',
    'minecraft:grass_block',
]);

const HASTE_AMPLIFIER = 10;

/**
 * Allows the player to dig with their bare hands with haste effects based on block type.
 */
@RegisterPower
export class ClawDigging implements Power {
    readonly id = 'claw_digging';

    static {
        world.beforeEvents.playerBreakBlock.subscribe((ev) => ClawDigging.onBeforeBreak(ev));
    }

    @PlayerTick(1)
    static onPlayerTick(player: Player): void {
        if (!PlayerState.for(player).hasPower('claw_digging')) {
            player.removeEffect('haste');
            return;
        }

        const heldItem = player.getComponent('equippable')?.getEquipment(EquipmentSlot.Mainhand);
        const isBareHanded = !heldItem || heldItem.typeId === 'minecraft:air';

        if (!isBareHanded) {
            player.removeEffect('haste');
            return;
        }

        const loc = player.location;

        const block = player.dimension.getBlock({
            x: Math.floor(loc.x),
            y: Math.floor(loc.y),
            z: Math.floor(loc.z),
        });
        const headBlock = player.dimension.getBlock({
            x: Math.floor(loc.x),
            y: Math.floor(loc.y) + 2,
            z: Math.floor(loc.z),
        });
        const oneBlockGap = player.dimension.getBlock({
            x: Math.floor(loc.x),
            y: Math.floor(loc.y) + 1,
            z: Math.floor(loc.z),
        });

        const isUnderground = loc.y < 60;
        const hasCeiling = headBlock !== undefined && !headBlock.isAir;
        const hasOneBlockGap = oneBlockGap !== undefined && !oneBlockGap.isAir;
        const inCave = isUnderground || hasCeiling || hasOneBlockGap || (block !== undefined && !block.isAir);

        if (inCave) {
            player.addEffect('haste', 250, { amplifier: HASTE_AMPLIFIER, showParticles: false });
        } else {
            player.removeEffect('haste');
        }
    }

    private static onBeforeBreak(ev: PlayerBreakBlockBeforeEvent): void {
        const { player, block } = ev;

        if (!PlayerState.for(player).hasPower('claw_digging')) return;
        if (player.getGameMode() === GameMode.Creative) return;

        ev.cancel = true;
        const { x, y, z } = block.location;
        system.run(() => {
            player.runCommand(`setblock ${x} ${y} ${z} air destroy`);
        });
    }
}