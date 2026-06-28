import { Player } from '@minecraft/server';
import { Power } from '../../core/abilities/Ability';
import { RegisterPower } from '../../core/abilities/Registries';
import { PlayerState } from '../../core/platform/PlayerState';

@RegisterPower
export class LightningSlowness implements Power {
    readonly id = 'lightning_slowness';
    readonly tickInterval = 5;

    onTick(player: Player): void {
        if (!PlayerState.for(player).hasPower('lightning_slowness')) return;

        player.addEffect('slowness', 15, {
            amplifier: 2,
            showParticles: false
        });
    }
}