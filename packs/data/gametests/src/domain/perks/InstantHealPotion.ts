import { Player } from '@minecraft/server';
import { Perk } from '../../core/abilities/Ability';
import { RegisterPerk } from '../../core/abilities/Registries';

@RegisterPerk
export class InstantHealPotion implements Perk {
    readonly id = 'instant_heal_potion';

    onAcquire(player: Player): void {
        player.runCommand('give @s potion 10 21');
    }
}