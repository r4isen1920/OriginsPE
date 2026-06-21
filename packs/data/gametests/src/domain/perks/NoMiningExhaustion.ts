import { Player } from '@minecraft/server';

import { Perk } from '../../core/abilities/Ability';
import { RegisterPerk } from '../../core/abilities/Registries';
import { PlayerState } from '../../core/platform/PlayerState';
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