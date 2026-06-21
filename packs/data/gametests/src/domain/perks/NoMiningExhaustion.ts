import { Player } from '@minecraft/server';

import { Perk } from '../Ability';
import { RegisterPerk } from '../Registries';
import { PlayerState } from '../../core/PlayerState';
import { AttributeService } from '../../services/AttributeService';


/**
 * Mining doesnt reduce saturation, allowing you to mine indefinitely without needing to eat.
 */
@RegisterPerk
export class NoMiningExhaustion implements Perk {
    readonly id = 'no_mining_exhaustion';

    onTick(player: Player): void {
        if (!PlayerState.for(player).hasPerk('no_mining_exhaustion')) return;
        AttributeService.apply(player, { exhaustion: 'miner' });
    }
}