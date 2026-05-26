import { Player } from '@minecraft/server';
import { Power } from '../Ability';
import { PlayerState } from '../../core/PlayerState';
import { RegisterPower } from '../Registries';
import { PlayerTick } from '../../core/Ticker';

@RegisterPower
export class Sea_inhabitant implements Power {
    readonly id = 'sea_inhabitant';

    @PlayerTick(3)
    static onTick(player: Player): void {
        player.triggerEvent("r4isen1920_originspe:family_type.fish");
        player.triggerEvent("r4isen1920_originspe:family_type.undead");
    }
}