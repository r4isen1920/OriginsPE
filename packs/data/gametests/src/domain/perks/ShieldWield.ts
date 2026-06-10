import { EquipmentSlot, Player, TicksPerSecond } from '@minecraft/server';

import { Perk } from '../Ability';
import { RegisterPerk } from '../Registries';
import { PlayerState } from '../../core/PlayerState';


/**
 * You get additional protection when blocking yourself with a shield.
 */
@RegisterPerk
export class ShieldWield implements Perk {
    readonly id = 'less_shield_slowdown';

    onRelease(player: Player): void {
        player.removeEffect('resistance');
    }

    onTick(player: Player): void {
        if (!PlayerState.for(player).hasPerk('less_shield_slowdown')) return;

        const offhand = player.getComponent('equippable')?.getEquipment(EquipmentSlot.Offhand);
        const hasShield = offhand?.typeId === 'minecraft:shield';
        const isBlocking = hasShield && player.getComponent('minecraft:is_blocking') !== undefined;

        if (isBlocking) {
            player.addEffect('resistance', TicksPerSecond * 3, { amplifier: 0, showParticles: false });
        } else {
            player.removeEffect('resistance');
        }
    }
}