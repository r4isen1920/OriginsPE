import { Player } from '@minecraft/server';
import { Power } from '../Ability';
import { RegisterPower } from '../Registries';
import { AttributeService } from '../../services/AttributeService';

@RegisterPower
export class Like_water implements Power {
    readonly id = 'like_water';
    readonly tickInterval = 3;

    onRelease(player: Player): void {
        AttributeService.apply(player, { buoyant: 'normal' });
    }

    onTick(player: Player): void {
        if (player.isSneaking || player.isSwimming) {
            AttributeService.apply(player, { buoyant: 'normal' });
            return;
        }

        AttributeService.apply(player, { buoyant: 'float_on_water' });
    }
}