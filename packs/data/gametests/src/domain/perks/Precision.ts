import { Player, ItemCompleteUseAfterEvent, world, system } from '@minecraft/server';

import { Perk } from '../Ability';
import { RegisterPerk } from '../Registries';
import { Entities } from '../../Files';
import { checkBow } from './Agility';


/**
 * When shooting a bow the arrows
 * you shoot travels in a straight line and have increased range.
 */
@RegisterPerk
export class Precision implements Perk {
    readonly id = 'precision';
    
    onTick(player: Player): void {
        if (!checkBow(player)) return;

        arrowPrecision(player);
    }
}

function arrowPrecision(player: Player): void {
    const arrows = player.dimension.getEntities({
        type: Entities.Arrow,
        location: player.location,
        maxDistance: 2,
    });

    for (const arrow of arrows) {
        const velocity = arrow.getVelocity();

        const boosted = {
            x: velocity.x * 1.5,
            y: velocity.y * 0.8,
            z: velocity.z * 1.5,
        };

        arrow.applyImpulse(boosted);
    }
}