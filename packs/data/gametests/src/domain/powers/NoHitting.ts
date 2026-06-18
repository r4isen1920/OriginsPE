import { EntityHitEntityAfterEvent, Player, world } from '@minecraft/server';
import { Power } from '../Ability';
import { RegisterPower } from '../Registries';
import { PlayerState } from '../../core/PlayerState';


/**
 * Starbornes have a chance of becoming temporarily immobilized whenever they are harmed by another entity.
 * In this state, their vision is also temporarily hindered.
 */
@RegisterPower
export class NoHitting implements Power {
    readonly id = 'no_hitting';

    private static handler: ((ev: EntityHitEntityAfterEvent) => void) | undefined;
    private static refCount = 0;

    onAcquire(_player: Player): void {
        NoHitting.refCount++;
        if (NoHitting.refCount === 1) {
            NoHitting.handler = (ev) => NoHitting.onEntityHit(ev);
            world.afterEvents.entityHitEntity.subscribe(NoHitting.handler);
        }
    }

    onRelease(_player: Player): void {
        NoHitting.refCount = Math.max(0, NoHitting.refCount - 1);
        if (NoHitting.refCount === 0 && NoHitting.handler) {
            world.afterEvents.entityHitEntity.unsubscribe(NoHitting.handler);
            NoHitting.handler = undefined;
        }
    }

    onTick(_player: Player): void {}

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