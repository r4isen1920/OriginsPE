import { Player, world } from '@minecraft/server';

import { Perk } from '../../core/abilities/Ability';
import { RegisterPerk } from '../../core/abilities/Registries';


/**
 * You start the game with a compass, a clock and nine empty maps
 * that will never drop on death.
 */
@RegisterPerk
export class ExplorerKit implements Perk {
    readonly id = 'explorer_kit';

    private givenPlayers = new Set<string>();

    onTick(player: Player): void {
        if (this.givenPlayers.has(player.id)) return;

        this.givenPlayers.add(player.id);

        try {
            player.runCommand('give @s minecraft:compass 1');
            player.runCommand('give @s minecraft:clock 1');
            player.runCommand('give @s minecraft:empty_map 9');
        } catch (e) {
            this.givenPlayers.delete(player.id);
        }
    }

    onUnequip(player: Player): void {
        try {
            player.runCommand('clear @s minecraft:compass');
            player.runCommand('clear @s minecraft:clock');
            player.runCommand('clear @s minecraft:empty_map');
        } catch (e) {}

        this.givenPlayers.delete(player.id);
    }
}