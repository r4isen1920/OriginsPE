import { ItemUseAfterEvent, Player } from '@minecraft/server';

import { Power } from '../../core/abilities/Ability';
import { RegisterPower } from '../../core/abilities/Registries';
import { PlayerState } from '../../core/platform/PlayerState';
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