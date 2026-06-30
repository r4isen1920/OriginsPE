import { Player } from '@minecraft/server';
import { Perk } from '../../core/abilities/Ability';
import { RegisterPerk } from '../../core/abilities/Registries';
import { PlayerState } from '../../core/platform/PlayerState';

@RegisterPerk
export class BunnyJump implements Perk {
    readonly id = 'bunny_jump';
    readonly tickInterval = 5;

    onTick(player: Player): void {
        if (!PlayerState.for(player).hasPerk('bunny_jump')) return;

        player.addEffect('jump_boost', 15, { 
            amplifier: 2, 
            showParticles: false 
        });
    }
}