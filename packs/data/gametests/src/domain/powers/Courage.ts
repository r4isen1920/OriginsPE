import { ItemUseAfterEvent, Player } from '@minecraft/server';

import { Power } from '../Ability';
import { RegisterPower } from '../Registries';

/**
 * You are immune from weakness and wither status effects.
 */
@RegisterPower
export class Courage implements Power {
    readonly id = 'courage';

    onTick(player: Player): void {
        
        if (player.getEffect('minecraft:weakness')) {
            player.removeEffect('minecraft:weakness');
        }

        if (player.getEffect('minecraft:wither')) {
            player.removeEffect('minecraft:wither');
        }
    }
}