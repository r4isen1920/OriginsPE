import { EquipmentSlot, GameMode, Player, system, TicksPerSecond, world, PlayerBreakBlockBeforeEvent } from '@minecraft/server';
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


/**
 * Allows the player to dig with their bare hands, with haste effects based on block type.
 */
@RegisterPower
export class ClawDigging implements Power {
    readonly id = 'claw_digging';

    private static breakHandler: ((ev: PlayerBreakBlockBeforeEvent) => void) | undefined;
    private static refCount = 0;

    onAcquire(_player: Player): void {
        ClawDigging.refCount++;
        if (ClawDigging.refCount === 1) {
            ClawDigging.breakHandler = (ev) => ClawDigging.onBeforeBreak(ev);
            world.beforeEvents.playerBreakBlock.subscribe(ClawDigging.breakHandler);
        }
    }

    onRelease(player: Player): void {
        player.removeEffect('haste');
        ClawDigging.refCount = Math.max(0, ClawDigging.refCount - 1);
        if (ClawDigging.refCount === 0 && ClawDigging.breakHandler) {
            world.beforeEvents.playerBreakBlock.unsubscribe(ClawDigging.breakHandler);
            ClawDigging.breakHandler = undefined;
        }
    }

    @PlayerTick(1)
    static onPlayerTick(player: Player): void {
        if (!PlayerState.for(player).hasPower('claw_digging')) return;

        const heldItem = player.getComponent('equippable')?.getEquipment(EquipmentSlot.Mainhand);
        const isBareHanded = !heldItem || heldItem.typeId === 'minecraft:air';

        let targetBlock;
        try {
            targetBlock = player.getBlockFromViewDirection()?.block;
        } catch {}

        if (!targetBlock?.isValid) {
            if (!isBareHanded) player.removeEffect('haste');
            return;
        }

        if (isBareHanded) {
            const isUnderground = player.location.y < 40;
            if (UNDERGROUND_BLOCKS.has(targetBlock.typeId) && isUnderground) {
                player.addEffect('haste', TicksPerSecond * 2, { amplifier: 15, showParticles: false });
            } else if (CLAW_DIGGABLE_BLOCKS.has(targetBlock.typeId)) {
                player.addEffect('haste', TicksPerSecond * 2, { amplifier: 3, showParticles: false });
            }
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