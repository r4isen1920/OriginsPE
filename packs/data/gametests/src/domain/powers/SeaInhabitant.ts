import { Player } from '@minecraft/server';
import { Power } from '../../core/abilities/Ability';
import { RegisterPower } from '../../core/abilities/Registries';
import { AttributeService } from '../../services/AttributeService';

@RegisterPower
export class SeaInhabitant implements Power {
    readonly id = 'sea_creature';
    readonly tickInterval = 3;

    onRelease(player: Player): void {
        AttributeService.apply(player, { familyType: 'player' });
    }

    onTick(player: Player): void {
        AttributeService.apply(player, { familyType: 'fish' });
        AttributeService.apply(player, { familyType: 'undead' });
    }
}