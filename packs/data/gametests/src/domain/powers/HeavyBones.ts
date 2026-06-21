import { Player, TicksPerSecond } from '@minecraft/server';
import { RegisterPower } from '../Registries';
import { Power } from '../Ability';
import { PlayerState } from '../../core/PlayerState';
import { PlayerTick } from '../../core/Ticker';


/**
 * Grants night vision when in dark areas.
 */
@RegisterPower
export class HeavyBones implements Power {
    readonly id = 'heavy_bones';

    onTick(player: Player): void {
        if(player.isInWater) {
            player.runCommand(`event entity @s r4isen1920_originspe:movement.0.025`);
        } else {
            player.runCommand(`event entity @s r4isen1920_originspe:movement.0.1`);
        }
    }
}