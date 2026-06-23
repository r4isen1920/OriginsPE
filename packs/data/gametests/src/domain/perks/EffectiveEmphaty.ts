import { Player } from '@minecraft/server';
import { Perk } from '../../core/abilities/Ability';
import { RegisterPerk } from '../../core/abilities/Registries';
import { PlayerState } from '../../core/platform/PlayerState';

const POTION_EFFECTS = [
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
    'weakness'
];

const lastPlayerEffects = new Map<string, Set<string>>();

@RegisterPerk
export class EffectiveEmpathy implements Perk {
    readonly id = 'effective_empathy';
    readonly tickInterval = 20;

    onTick(player: Player): void {
        if (!PlayerState.for(player).hasPerk('effective_empathy')) {
            lastPlayerEffects.delete(player.id);
            return;
        }

        if (!lastPlayerEffects.has(player.id)) {
            lastPlayerEffects.set(player.id, new Set<string>());
        }

        const previousEffects = lastPlayerEffects.get(player.id)!;
        const currentEffects = new Set<string>();
        const activeEffects: { id: string; seconds: number; amp: number }[] = [];

        for (const effectId of POTION_EFFECTS) {
            const effect = player.getEffect(effectId);
            if (effect && effect.amplifier < 10) {
                currentEffects.add(effectId);
                activeEffects.push({
                    id: effectId,
                    seconds: Math.max(1, Math.ceil(effect.duration / 20)),
                    amp: effect.amplifier
                });
            }
        }

        for (const oldEffectId of previousEffects) {
            if (!currentEffects.has(oldEffectId)) {
                player.runCommand(`execute as @e[r=21,type=wolf,tag=perk_tamed_animal_boost] run effect @s ${oldEffectId} 0`);
                player.runCommand(`execute as @e[r=21,type=cat,tag=perk_tamed_animal_boost] run effect @s ${oldEffectId} 0`);
                player.runCommand(`execute as @e[r=21,type=parrot,tag=perk_tamed_animal_boost] run effect @s ${oldEffectId} 0`);
            }
        }

        lastPlayerEffects.set(player.id, currentEffects);

        if (activeEffects.length === 0) return;

        for (const effect of activeEffects) {
            player.runCommand(`execute as @e[r=21,type=wolf,tag=perk_tamed_animal_boost] run effect @s ${effect.id} ${effect.seconds} ${effect.amp} true`);
            player.runCommand(`execute as @e[r=21,type=cat,tag=perk_tamed_animal_boost] run effect @s ${effect.id} ${effect.seconds} ${effect.amp} true`);
            player.runCommand(`execute as @e[r=21,type=parrot,tag=perk_tamed_animal_boost] run effect @s ${effect.id} ${effect.seconds} ${effect.amp} true`);
        }
    }
}