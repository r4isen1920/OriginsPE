// Soulburst.ts
import { Player, system } from '@minecraft/server';
import { PlayerState } from '../../core/platform/PlayerState';
import { RegisterPower } from '../../core/abilities/Registries';
import { Power } from '../../core/abilities/Ability';

const PHASE_KEY = 'r4isen1920_originspe:beelzebub_phase';
const DMG_KEY = 'r4isen1920_originspe:beelzebub_dmg';

@RegisterPower
export class Soulburst implements Power {
    readonly id = 'soulburst';
}

export function getBeelzebubPhase(player: Player): number {
    return (player.getDynamicProperty(PHASE_KEY) as number) ?? 0;
}

export function getBeelzebubDmg(player: Player): number {
    return (player.getDynamicProperty(DMG_KEY) as number) ?? 0;
}

export function incrementBeelzebubPhase(player: Player, increment: number): void {
    const next = Math.min(Math.max(getBeelzebubPhase(player) + increment, 0), 4);
    player.setDynamicProperty(PHASE_KEY, next);
}

export function incrementBeelzebubDmg(player: Player, increment: number): void {
    player.setDynamicProperty(DMG_KEY, getBeelzebubDmg(player) + increment);
}

export function soulburst(attacker: Player, hurtEntity: any): void {
    const state = PlayerState.for(attacker);

    if (getBeelzebubPhase(attacker) < 3) return;
    if (state.isOnCooldown('beelzebub_soulburst', system.currentTick)) return;

    attacker.runCommand(`damage @e[tag="_beelzebub_target_${attacker.id}",c=1] ${Math.ceil(getBeelzebubDmg(attacker))}`);

    incrementBeelzebubPhase(attacker, -3);
    incrementBeelzebubDmg(attacker, -getBeelzebubDmg(attacker));

    // world.playSound('ender_eye.dead', hurtEntity.location, { volume: 2.0 });
    hurtEntity.dimension.spawnParticle('r4isen1920_originspe:voidwalker_soulburst', {
        x: hurtEntity.location.x,
        y: hurtEntity.location.y + 1,
        z: hurtEntity.location.z,
    });

    const headLoc = attacker.getHeadLocation();
    const viewDir = attacker.getViewDirection();
    attacker.dimension.spawnParticle('r4isen1920_originspe:voidwalker_beelzebub_phase_4', {
        x: headLoc.x + viewDir.x * 1.75,
        y: headLoc.y + viewDir.y * 1.75,
        z: headLoc.z + viewDir.z * 1.75,
    });

    hurtEntity.removeTag(`_beelzebub_target_${attacker.id}`);
}