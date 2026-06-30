import { EntityDamageCause, EntityHurtBeforeEvent, Player } from '@minecraft/server';
import { Power } from '../../core/abilities/Ability';
import { RegisterPower } from '../../core/abilities/Registries';


/**
 * Inchlings are immune to thorns and velocity-based damage.
 */
@RegisterPower
export class Nimble implements Power {
	readonly id = 'nimble';

    onHurtBefore(_player: Player, ev: EntityHurtBeforeEvent): void {
        const cause = ev.damageSource?.cause;

        if (cause === EntityDamageCause.thorns) {
            ev.cancel = true;
            return;
        }

        const velocityDamageCauses: EntityDamageCause[] = [
            EntityDamageCause.contact,
            EntityDamageCause.fall,
            EntityDamageCause.projectile,
            EntityDamageCause.flyIntoWall,
        ];
        if (cause && velocityDamageCauses.includes(cause)) {
            ev.cancel = true;
        }
    }
}
