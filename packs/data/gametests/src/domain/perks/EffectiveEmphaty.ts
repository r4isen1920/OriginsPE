import {
    EffectAddAfterEvent,
    Player,
    world,
} from '@minecraft/server';

import { Perk } from '../../core/abilities/Ability';
import { RegisterPerk } from '../../core/abilities/Registries';
import { PlayerState } from '../../core/platform/PlayerState';


const POTION_EFFECTS = new Set([
    'fire_resistance',
    'invisibility',
    'jump_boost',
    'night_vision',
    'poison',
    'regeneration',
    'resistance',
    'slow_falling',
    'slowness',
    'speed',
    'strength',
    'water_breathing',
    'weakness',
]);


/**
 * Potion effects you receive are also applied to your nearby tamed animals.
 */
@RegisterPerk
export class EffectiveEmpathy implements Perk {
    readonly id = 'effective_empathy';

    private static handler: ((ev: EffectAddAfterEvent) => void) | undefined;
    private static refCount = 0;

    onAcquire(_player: Player): void {
        EffectiveEmpathy.refCount++;
        if (EffectiveEmpathy.refCount === 1) {
            EffectiveEmpathy.handler = (ev) => EffectiveEmpathy.onEffectAdd(ev);
            world.afterEvents.effectAdd.subscribe(EffectiveEmpathy.handler);
        }
    }

    onRelease(_player: Player): void {
        EffectiveEmpathy.refCount = Math.max(0, EffectiveEmpathy.refCount - 1);
        if (EffectiveEmpathy.refCount === 0 && EffectiveEmpathy.handler) {
            world.afterEvents.effectAdd.unsubscribe(EffectiveEmpathy.handler);
            EffectiveEmpathy.handler = undefined;
        }
    }

    onTick(_player: Player): void {}
    private static isApplying = false;

    private static onEffectAdd(ev: EffectAddAfterEvent): void {
        const { entity, effect } = ev;

        if (EffectiveEmpathy.isApplying) return;
        if (entity.typeId !== 'minecraft:player') return;
        if (!PlayerState.for(entity as Player).hasPerk('effective_empathy')) return;
        if (!POTION_EFFECTS.has(effect.typeId)) return;
        if (effect.amplifier >= 10) return;

        EffectiveEmpathy.isApplying = true;
        try {
            entity.dimension.getEntities({
                location: entity.location,
                maxDistance: 21,
                excludeFamilies: ['player', 'inanimate'],
            }).forEach(nearbyEntity => {
                nearbyEntity.addEffect(effect.typeId, effect.duration, {
                    amplifier: effect.amplifier || 0,
                });
            });
        } finally {
            EffectiveEmpathy.isApplying = false;
        }
    }
}