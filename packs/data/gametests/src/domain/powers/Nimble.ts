import { Player, world } from '@minecraft/server';
import { Power } from '../Ability';
import { RegisterPower } from '../Registries';
import { PlayerState } from '../../core/PlayerState';


/**
 * Inchlings are immune to thorns and velocity-based damage.
 */
@RegisterPower
export class Nimble implements Power {
	readonly id = 'nimble';

    static {
        world.beforeEvents.entityHurt.subscribe((ev) => Nimble.onBeforeHurt(ev));
    }

    private static onBeforeHurt(ev: any): void {
        const player = ev.hurtEntity;
        if (player?.typeId !== 'minecraft:player') return;
        if (!PlayerState.for(player as Player).hasPower('nimble')) return;

        const damageSource = ev.damageSource;
        const cause = damageSource?.cause;

        // Immune to thorns damage
        if (cause === 'thorns') {
            ev.cancel = true;
            return;
        }

        // Immune to velocity-based damage (knockback, fall damage, projectiles)
        const velocityDamageCauses = ['contact', 'fall', 'projectile', 'flyIntoWall'];
        if (velocityDamageCauses.includes(cause)) {
            ev.cancel = true;
        }
    }
}
