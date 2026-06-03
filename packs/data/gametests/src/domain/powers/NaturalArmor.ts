import { Player } from '@minecraft/server';
import { RegisterPower } from '../Registries';
import { Power } from '../Ability';


/**
 * Even without wearing armor, your skin provides natural protection thus receiving 20% less damage from any source.
 */
@RegisterPower
export class NaturalArmor implements Power {
    readonly id = 'natural_armor';

    onTick(player: Player): void {
        if (!player.hasTag('power_natural_armor')) {
            player.addTag('power_natural_armor');
        }
    }

    onRelease(player: Player): void {
        player.removeTag('power_natural_armor');
    }
}