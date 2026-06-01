import { Player, TicksPerSecond } from '@minecraft/server';
import { Power } from '../Ability';
import { RegisterPower } from '../Registries';

@RegisterPower
export class AquaAffinity implements Power {
    readonly id = 'aqua_affinity';
    readonly tickInterval = 3;

    onTick(player: Player): void {
        try {
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