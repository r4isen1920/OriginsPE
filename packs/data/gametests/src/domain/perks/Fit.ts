import { Player } from '@minecraft/server';

import { Perk } from '../Ability';
import { RegisterPerk } from '../Registries';


/**
 * Sprint doesnt reduce saturation, allowing you to sprint indefinitely without needing to eat.
 */
@RegisterPerk
export class Fit implements Perk {
    readonly id = 'fit';

    onTick(player: Player): void {
        const isSprinting = player.isSprinting;
        
        if (isSprinting) {
            player.addEffect('saturation', 2, { amplifier: 1, showParticles: false });
        }
    }
}