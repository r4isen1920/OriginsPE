import { Player, world } from '@minecraft/server';
import { Power } from '../../core/abilities/Ability';
import { RegisterPower } from '../../core/abilities/Registries';
import { PlayerState } from '../../core/platform/PlayerState';

export let isThunderstormActive = false;

world.afterEvents.weatherChange.subscribe((event) => {
    if (event.dimension === 'overworld') {
        isThunderstormActive = (event.newWeather === 'Thunder');
    }
});

@RegisterPower
export class StormBorn implements Power {
    readonly id = 'storm_born';
    readonly tickInterval = 20;

    onTick(player: Player): void {
        if (!PlayerState.for(player).hasPower('storm_born')) return;

        if (isThunderstormActive) {
            player.addEffect('strength', 30, {
                amplifier: 1,
                showParticles: false
            });
        }
    }
}