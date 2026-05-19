import { Player, world, system } from '@minecraft/server';

import { Perk } from '../Ability';
import { RegisterPerk } from '../Registries';
import { checkBow } from './Agility';

/**
 * When shooting a bow the arrows
 * you shoot travels in a straight line and have increased range.
 */
@RegisterPerk
export class Precision implements Perk {
    readonly id = 'precision';

    onTick(player: Player): void {
        const isShooting = checkBow(player);

        if (isShooting) {
            player.addTag('perk_no_projectile_divergence');
        } else {
            player.removeTag('perk_no_projectile_divergence');
        }
    }

}