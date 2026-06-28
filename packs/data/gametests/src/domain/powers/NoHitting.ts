import { EntityHitEntityAfterEvent, Player } from '@minecraft/server';
import { Power } from '../../core/abilities/Ability';
import { RegisterPower } from '../../core/abilities/Registries';
import { PlayerState } from '../../core/platform/PlayerState';
import { AfterEntityHitEntity } from '../../core';


/**
 * Starbornes have a chance of becoming temporarily immobilized whenever they are harmed by another entity.
 * In this state, their vision is also temporarily hindered.
 */
@RegisterPower
export class NoHitting implements Power {
    readonly id = 'no_hitting';

    @AfterEntityHitEntity
    private static onEntityHit(ev: EntityHitEntityAfterEvent): void {
        const { hitEntity } = ev;

        if (hitEntity.typeId !== 'minecraft:player') return;
        if (!PlayerState.for(hitEntity as Player).hasPower('no_hitting')) return;
        if (Math.random() > 0.25) return;

        // Vision hindered effect
        (hitEntity as Player).camera.fade({
            fadeColor: { red: 0, green: 0, blue: 0 },
            fadeTime: {
                fadeInTime: 0.1,
                fadeOutTime: 1, 
                holdTime: 1,
            },
        });

        // Immobilization effects
        hitEntity.addEffect('slowness', 100, { amplifier: 3, showParticles: true });
        hitEntity.addEffect('darkness', 100, { amplifier: 0, showParticles: false });
    }
}