import {
    EntityDamageCause,
    EntityHurtBeforeEvent,
    ItemCompleteUseAfterEvent,
    Player,
    TicksPerSecond,
} from '@minecraft/server';

import { Power } from '../../core/abilities/Ability';
import { RegisterPower } from '../../core/abilities/Registries';
import { PlayerTick } from '../../core/platform/Ticker';


const REGEN_CHANCE = 0.10;


/**
 * Sweet berries restore more hunger when eaten and sometimes grant regeneration.
 * You are also not damaged by berry bushes.
 */
@RegisterPower
export class BerryCraver implements Power {
    readonly id = 'berry_craver';

    @PlayerTick(3)
    static onPlayerTick(_player: Player): void {}

    onItemCompleteUse(player: Player, ev: ItemCompleteUseAfterEvent): void {
        if (ev.itemStack.typeId !== 'minecraft:sweet_berries') return;

        player.addEffect('saturation', 4, {
            amplifier: 0,
            showParticles: false,
        });

        if (Math.random() < REGEN_CHANCE) {
            player.addEffect('regeneration', TicksPerSecond * 10, {
                amplifier: 1,
                showParticles: true,
            });
        }
    }

    onHurtBefore(_player: Player, ev: EntityHurtBeforeEvent): void {
        // Cancel all contact damage (berry bushes and similar)
        if (ev.damageSource?.cause === EntityDamageCause.contact) {
            ev.cancel = true;
        }
    }
}