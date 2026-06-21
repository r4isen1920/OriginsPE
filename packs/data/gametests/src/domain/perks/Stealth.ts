import { Player, TicksPerSecond } from '@minecraft/server';

import { Perk } from '../Ability';
import { RegisterPerk } from '../Registries';
import { PlayerState } from '../../core/PlayerState';


/**
 * In the Shadows: When you have the invisibility effect applied, your next attacks deal more damage.
 */
@RegisterPerk
export class Stealth implements Perk {
    readonly id = 'stealth';

    onTick(player: Player): void {
        if (!PlayerState.for(player).hasPerk('stealth')) return;
        if (player.getEffect('invisibility') === undefined) return;
        player.addEffect('strength', TicksPerSecond * 3, { amplifier: 0, showParticles: true });
    }
}