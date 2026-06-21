import { Player } from '@minecraft/server';

import { Perk } from '../Ability';
import { RegisterPerk } from '../Registries';
import { PlayerState } from '../../core/PlayerState';
import { AttributeService } from '../../services/AttributeService';


/**
 * Your nameplate is never always visible, even when you're not sneaking.
 */
@RegisterPerk
export class Sneaky implements Perk {
    readonly id = 'sneaky';

    onTick(player: Player): void {
        if (!PlayerState.for(player).hasPerk('sneaky')) {
            AttributeService.apply(player, { displayName: true });
        } else {
            AttributeService.apply(player, { displayName: false });
        }    
    }
}