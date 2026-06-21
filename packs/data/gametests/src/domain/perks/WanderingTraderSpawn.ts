import { Player } from '@minecraft/server';

import { Perk } from '../../core/abilities/Ability';
import { RegisterPerk } from '../../core/abilities/Registries';
import { PlayerState } from '../../core/platform/PlayerState';


/**
 * A wandering trader will occasionally spawn near you.
 */
@RegisterPerk
export class WanderingTraderSpawn implements Perk {
    readonly id = 'wandering_trader_spawn';

    onTick(player: Player): void {
        if (!PlayerState.for(player).hasPerk('wandering_trader_spawn')) return;
        if (Math.random() < 0.5) return;

        const isWanderingTraderNearby = player.dimension.getEntities({
            location: player.location,
            maxDistance: 48,
            type: 'minecraft:wandering_trader',
        });
        if (isWanderingTraderNearby.length > 0) return;

        player.dimension.spawnEntity('minecraft:wandering_trader', {
            x: player.location.x + (Math.random() * 32 - 16),
            y: player.location.y + 1,
            z: player.location.z + (Math.random() * 32 - 16),
        });
    }
}