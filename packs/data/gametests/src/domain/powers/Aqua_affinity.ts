import { Player, TicksPerSecond } from '@minecraft/server';
import { Power } from '../Ability';
import { PlayerState } from '../../core/PlayerState';
import { RegisterPower } from '../Registries';
import { PlayerTick } from '../../core/Ticker';

@RegisterPower
export class Aqua_affinity implements Power {
    readonly id = 'aqua_affinity';

    @PlayerTick(3)
    static onTick(player: Player): void {
        try {
            const state = PlayerState.for(player);
            if (state.getOrigin() !== 'merling') return;

            player.addEffect('night_vision', TicksPerSecond * 12, {
                amplifier: 4,
                showParticles: false
            });

            player.addEffect('water_breathing', TicksPerSecond * 12, {
                amplifier: 0,
                showParticles: false
            });

            player.addEffect('haste', TicksPerSecond * 12, {
                amplifier: 2,
                showParticles: false
            });
        } catch {}
    }
}