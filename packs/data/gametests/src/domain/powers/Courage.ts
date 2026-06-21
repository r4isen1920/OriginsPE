import { ItemUseAfterEvent, Player } from '@minecraft/server';

import { Power } from '../../core/abilities/Ability';
import { RegisterPower } from '../../core/abilities/Registries';

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