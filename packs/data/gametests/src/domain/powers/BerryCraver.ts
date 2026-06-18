import {
    ItemCompleteUseAfterEvent,
    Player,
    TicksPerSecond,
    world,
} from '@minecraft/server';

import { Power } from '../Ability';
import { RegisterPower } from '../Registries';
import { PlayerState } from '../../core/PlayerState';
import { PlayerTick } from '../../core/Ticker';


const REGEN_CHANCE = 0.10;


/**
 * Sweet berries restore more hunger when eaten and sometimes grant regeneration.
 * You are also not damaged by berry bushes.
 */
@RegisterPower
export class BerryCraver implements Power {
    readonly id = 'berry_craver';

    static {
        world.afterEvents.itemCompleteUse.subscribe((ev) => BerryCraver.onItemCompleteUse(ev));
        world.beforeEvents.entityHurt.subscribe((ev) => BerryCraver.onBeforeHurt(ev));
    }

    @PlayerTick(3)
    static onPlayerTick(_player: Player): void {}

    private static onItemCompleteUse(ev: ItemCompleteUseAfterEvent): void {
        const { itemStack, source } = ev;
        if (itemStack.typeId !== 'minecraft:sweet_berries') return;
        if (source.typeId !== 'minecraft:player') return;
        if (!PlayerState.for(source as Player).hasPower('berry_craver')) return;

        source.addEffect('saturation', TicksPerSecond * 2, {
            amplifier: 1,
            showParticles: false,
        });

        if (Math.random() < REGEN_CHANCE) {
            source.addEffect('regeneration', TicksPerSecond * 10, {
                amplifier: 1,
                showParticles: true,
            });
        }
    }

    private static onBeforeHurt(ev: any): void {
        const player = ev.hurtEntity;
        if (player?.typeId !== 'minecraft:player') return;
        if (!PlayerState.for(player as Player).hasPower('berry_craver')) return;

        // Cancel all contact damage (berry bushes and similar)
        if (ev.damageSource?.cause === 'contact') {
            ev.cancel = true;
        }
    }
}