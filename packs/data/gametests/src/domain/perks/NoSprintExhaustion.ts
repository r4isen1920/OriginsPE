import { Player } from '@minecraft/server';

import { Perk } from '../Ability';
import { RegisterPerk } from '../Registries';
import { PlayerState } from '../../core/PlayerState';


/**
 * Sprint doesnt reduce saturation, allowing you to sprint indefinitely without needing to eat.
 */
@RegisterPerk
export class NoSprintExhaustion implements Perk {
    readonly id = 'no_sprint_exhaustion';

    onAcquire(player: Player): void {
        player.triggerEvent('r4isen1920_originspe:exhaustion.explorer');
    }

    onRelease(player: Player): void {
        player.triggerEvent('r4isen1920_originspe:exhaustion.normal');
    }

    // onTick(player: Player): void {
    //     if (!PlayerState.for(player).hasPerk('fit')) return;
    //     if (!player.isSprinting) return;
    //     player.addEffect('saturation', 2, { amplifier: 1, showParticles: false });
    // }
}