import { ItemUseAfterEvent, Player } from '@minecraft/server';

import { Power } from '../Ability';
import { RegisterPower } from '../Registries';
import { PlayerState } from '../../core/PlayerState';
import { AttributeService } from '../../services/AttributeService';

/**
 * You get even more hungry than usual when replenishing health.
 */
@RegisterPower
export class Gluttony implements Power {
    readonly id = 'gluttony';

    onTick(player: Player): void {
        const state = PlayerState.for(player);

        if (!state.hasPower('gluttony')) return;

        AttributeService.apply(player, { exhaustion: 'piglin' });
    }
}