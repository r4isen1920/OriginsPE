import { Player } from '@minecraft/server';
import { Perk } from '../../core/abilities/Ability';
import { RegisterPerk } from '../../core/abilities/Registries';
import { PlayerState } from '../../core/platform/PlayerState';

@RegisterPerk
export class HighJump implements Perk {
    readonly id = 'high_jump';
    readonly tickInterval = 5;

    onTick(player: Player): void {
        if (!PlayerState.for(player).hasPerk('high_jump')) return;

        player.addEffect('jump_boost', 15, { 
            amplifier: 2, 
            showParticles: false 
        });
    }
}