import { Player } from '@minecraft/server';
import { Power } from '../Ability';
import { RegisterPower } from '../Registries';
import { AttributeService } from '../../services/AttributeService';

@RegisterPower
export class Sea_inhabitant implements Power {
    readonly id = 'sea_inhabitant';
    readonly tickInterval = 3;

    onRelease(player: Player): void {
        AttributeService.apply(player, { familyType: 'player' });
    }

    onTick(player: Player): void {
        AttributeService.apply(player, { familyType: 'fish' });
        AttributeService.apply(player, { familyType: 'undead' });
    }
}