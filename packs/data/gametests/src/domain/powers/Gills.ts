import { Player, EntityDamageCause } from '@minecraft/server';
import { Power } from '../Ability';
import { PlayerState } from '../../core/PlayerState';
import { RegisterPower } from '../Registries';
import { PlayerTick } from '../../core/Ticker';

@RegisterPower
export class Gills implements Power {
    readonly id = 'gills';

    @PlayerTick(3)
    static onTick(player: Player): void {
        try {
            const state = PlayerState.for(player);
            if (state.getOrigin() !== 'merling') return;

            const isInWater = player.isSwimming || player.isInWater;

            if (isInWater) {
                try {
                    player.triggerEvent('r4isen1920_originspe:breathable.underwater');
                } catch {}
                state.setFlag('gills_active', true);
            } else {
                player.applyDamage(1, { cause: EntityDamageCause.drowning });
                state.setFlag('gills_active', false);
            }
        } catch {}
    }
}