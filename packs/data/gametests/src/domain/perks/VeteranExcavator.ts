import { Player } from '@minecraft/server';

import { Perk } from '../Ability';
import { RegisterPerk } from '../Registries';
import { PlayerState } from '../../core/PlayerState';


/**
 * Mining doesnt reduce saturation, allowing you to mine indefinitely without needing to eat.
 */
@RegisterPerk
export class VeteranExcavator implements Perk {
    readonly id = 'veteran_excavator';

    onTick(player: Player): void {
        if (!PlayerState.for(player).hasPerk('veteran_excavator')) return;
        player.triggerEvent('r4isen1920_originspe:exhaustion.miner');
    }
}