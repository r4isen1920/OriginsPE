import { Player } from '@minecraft/server';
import { Power } from '../Ability';
import { PlayerState } from '../../core/PlayerState';
import { RegisterPower } from '../Registries';
import { PlayerTick } from '../../core/Ticker';

@RegisterPower
export class Like_water implements Power {
    readonly id = 'like_water';

    @PlayerTick(3)
    static onTick(player: Player): void {
        try {
            const state = PlayerState.for(player);
            if (state.getOrigin() !== 'merling') {
                player.triggerEvent('r4isen1920_originspe:buoyant.normal');
                return;
            }

            if (player.isSneaking || player.isSwimming) {
                player.triggerEvent('r4isen1920_originspe:buoyant.normal');
                return;
            }

            player.triggerEvent('r4isen1920_originspe:buoyant.float_on_water');
        } catch {}
    }
}