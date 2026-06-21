import { Player } from '@minecraft/server';

import { Perk } from '../../core/abilities/Ability';
import { RegisterPerk } from '../../core/abilities/Registries';
import { PlayerState } from '../../core/platform/PlayerState';
import { AttributeService } from '../../services/AttributeService';


/**
 * Sprint doesnt reduce saturation, allowing you to sprint indefinitely without needing to eat.
 */
@RegisterPerk
export class NoSprintExhaustion implements Perk {
    readonly id = 'no_sprint_exhaustion';

    onAcquire(player: Player): void {
        AttributeService.apply(player, { exhaustion: 'explorer' });
    }

    onRelease(player: Player): void {
        AttributeService.apply(player, { exhaustion: 'normal' });
    }

    // onTick(player: Player): void {
    //     if (!PlayerState.for(player).hasPerk('fit')) return;
    //     if (!player.isSprinting) return;
    //     player.addEffect('saturation', 2, { amplifier: 1, showParticles: false });
    // }
}