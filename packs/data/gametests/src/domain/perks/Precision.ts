import { Player } from '@minecraft/server';

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

    onAcquire(_player: Player): void {}

    onRelease(player: Player): void {
        player.removeTag('perk_no_projectile_divergence');
    }

    onTick(player: Player): void {
        if (checkBow(player)) {
            player.addTag('perk_no_projectile_divergence');
        } else {
            player.removeTag('perk_no_projectile_divergence');
        }
    }
}