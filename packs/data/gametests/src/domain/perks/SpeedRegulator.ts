import { Player } from '@minecraft/server';
import { Perk } from '../../core/abilities/Ability';
import { RegisterPerk } from '../../core/abilities/Registries';
import { PlayerState } from '../../core/platform/PlayerState';

@RegisterPerk
export class SpeedRegulator implements Perk {
    readonly id = 'speed_regulator';
    readonly tickInterval = 5;

    onTick(player: Player): void {
        if (!PlayerState.for(player).hasPerk('speed_regulator')) return;

        if (player.isSprinting) {
            player.addEffect('speed', 15, {
                amplifier: 1,
                showParticles: false
            });
        } else {
            player.addEffect('speed', 15, {
                amplifier: 2,
                showParticles: false
            });
        }
    }
}