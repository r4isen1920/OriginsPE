import { Player, world } from '@minecraft/server';

import { Perk } from '../Ability';
import { RegisterPerk } from '../Registries';
import { PlayerState } from '../../core/PlayerState';
import { PlayerTick } from '../../core/Ticker';
import { checkBow } from './Agility';


/**
 * When shooting a bow the arrows
 * you shoot travels in a straight line and have increased range.
 */
@RegisterPerk
export class Precision implements Perk {
    readonly id = 'no_projectile_divergence';

    static {
        world.afterEvents.projectileHitEntity.subscribe((event) => {
            const projectile = event.projectile;

            if (projectile.typeId !== 'minecraft:arrow') return;

            const shooter = event.source;
            if (!shooter || shooter.typeId !== 'minecraft:player') return;

            if (!PlayerState.for(shooter as Player).hasPerk('no_projectile_divergence')) return;

            const hitEntity = event.getEntityHit()?.entity;
            if (!hitEntity) return;

            hitEntity.dimension.spawnParticle(
                'r4isen1920_originspe:accuracy_on_hit',
                hitEntity.location
            );
        });
    }

    onTick(player: Player): void {
        if (!PlayerState.for(player).hasPerk('no_projectile_divergence')) {
            player.removeTag('perk_no_projectile_divergence');
            return;
        }

        if (checkBow(player)) {
            player.addTag('perk_no_projectile_divergence');
        } else {
            player.removeTag('perk_no_projectile_divergence');
        }
    }
}