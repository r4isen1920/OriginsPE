import { Player } from '@minecraft/server';
import { Power } from '../../core/abilities/Ability';
import { RegisterPower } from '../../core/abilities/Registries';
import { PlayerState } from '../../core/platform/PlayerState';
import { AttributeService } from '../../services/AttributeService';

@RegisterPower
export class LightningSlowness implements Power {
    readonly id = 'lightning_slowness';
    readonly tickInterval = 3;

    onRelease(player: Player): void {
        const state = PlayerState.for(player);
        if (state.getFlag<boolean>('slow_set') === true) {
            AttributeService.apply(player, { movement: 0.1 });
            state.setFlag('slow_set', false);
        }
    }

    onTick(player: Player): void {
        const state = PlayerState.for(player);
        
        if (!state.hasPower('lightning_slowness')) {
            this.onRelease(player);
            return;
        }

        const wasSlowApplied = state.getFlag<boolean>('slow_set') === true;
        if (wasSlowApplied) return;

        AttributeService.apply(player, { movement: 0.05 });
        state.setFlag('slow_set', true);
    }
}