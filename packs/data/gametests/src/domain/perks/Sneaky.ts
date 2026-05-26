import { Player } from '@minecraft/server';

import { Perk } from '../Ability';
import { RegisterPerk } from '../Registries';
import { PlayerState } from '../../core/PlayerState';


/**
 * Your nameplate is never always visible, even when you're not sneaking.
 */
@RegisterPerk
export class Sneaky implements Perk {
    readonly id = 'sneaky';

    onTick(player: Player): void {
        if (!PlayerState.for(player).hasPerk('sneaky')) {
            player.triggerEvent('r4isen1920_originspe:nameplate.true');
        } else {
            player.triggerEvent('r4isen1920_originspe:nameplate.false');
        }    
    }
}