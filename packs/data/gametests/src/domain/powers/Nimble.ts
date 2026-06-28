import { Player } from '@minecraft/server';
import { Power } from '../../core/abilities/Ability';
import { RegisterPower } from '../../core/abilities/Registries';
import { PlayerState } from '../../core/platform/PlayerState';
import { BeforeEntityHurt } from '../../core';


/**
 * Inchlings are immune to thorns and velocity-based damage.
 */
@RegisterPower
export class Nimble implements Power {
	readonly id = 'nimble';

    @BeforeEntityHurt
    private static onBeforeHurt(ev: any): void {
        const player = ev.hurtEntity;
        if (player?.typeId !== 'minecraft:player') return;
        if (!PlayerState.for(player as Player).hasPower('nimble')) return;

        const damageSource = ev.damageSource;
        const cause = damageSource?.cause;

        if (cause === 'thorns') {
            ev.cancel = true;
            return;
        }

        const velocityDamageCauses = ['contact', 'fall', 'projectile', 'flyIntoWall'];
        if (velocityDamageCauses.includes(cause)) {
            ev.cancel = true;
        }
    }
}
