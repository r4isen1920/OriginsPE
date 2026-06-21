import { EntitySpawnAfterEvent, Player, TicksPerSecond, world } from '@minecraft/server';

import { Perk } from '../../core/abilities/Ability';
import { RegisterPerk } from '../../core/abilities/Registries';
import { PlayerState } from '../../core/platform/PlayerState';

@RegisterPerk
export class CheaperTrades implements Perk {
    readonly id = 'cheaper_trades';

    onTick(player: Player): void {
        if (!PlayerState.for(player).hasPerk('cheaper_trades')) return;

        player.addEffect('village_hero', TicksPerSecond * 12, { amplifier: 0, showParticles: false });
    }
}
