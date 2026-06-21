// Beelzebub.ts
import {
    EntityDamageCause,
    EntityHurtAfterEvent,
    Player,
    world,
} from '@minecraft/server';

import { Power } from '../../core/abilities/Ability';
import { RegisterPower } from '../../core/abilities/Registries';
import { PlayerState } from '../../core/platform/PlayerState';
import { PlayerTick } from '../../core/platform/Ticker';
import { ResourceBarService } from '../../services/ResourceBarService';
import { lifeDrain } from './LifeDrain';
import {
    soulburst,
    getBeelzebubPhase,
    incrementBeelzebubPhase,
    incrementBeelzebubDmg,
} from './SoulBurst';


const BAR_ID = 19;
const BAR_VALUES = [0, 29, 71, 100, 100];

const PHASE_KEY = 'r4isen1920_originspe:beelzebub_phase';
const DMG_KEY = 'r4isen1920_originspe:beelzebub_dmg';


/**
 * Beelzebub — attacking enemies drains their health to you and builds up a
 * phase meter; at phase 3+ your next hit unleashes a soulburst that deals
 * accumulated bonus damage to your target.
 */
@RegisterPower
export class Beelzebub implements Power {
    readonly id = 'beelzebub';
    readonly icon = '19';

    private static handler: ((ev: EntityHurtAfterEvent) => void) | undefined;
    private static refCount = 0;
    private static lastHitTimes = new Map<string, number>();

    onAcquire(_player: Player): void {
        Beelzebub.refCount++;
        if (Beelzebub.refCount === 1) {
            Beelzebub.handler = (ev) => Beelzebub.onEntityHurt(ev);
            world.afterEvents.entityHurt.subscribe(Beelzebub.handler);
        }
    }

    onRelease(player: Player): void {
        Beelzebub.refCount = Math.max(0, Beelzebub.refCount - 1);
        if (Beelzebub.refCount === 0 && Beelzebub.handler) {
            world.afterEvents.entityHurt.unsubscribe(Beelzebub.handler);
            Beelzebub.handler = undefined;
        }

        player.setDynamicProperty(PHASE_KEY, undefined);
        player.setDynamicProperty(DMG_KEY, undefined);
        PlayerState.for(player).setFlag('beelzebub_bar_init', undefined);
        ResourceBarService.pop(player, BAR_ID);
    }

    @PlayerTick(3)
    static onPlayerTick(player: Player): void {
        if (!PlayerState.for(player).hasPower('beelzebub')) return;

        const state = PlayerState.for(player);
        if (!state.getFlag<boolean>('beelzebub_bar_init')) {
            const phase = getBeelzebubPhase(player);
            ResourceBarService.push(player, {
                id: BAR_ID,
                from: BAR_VALUES[phase],
                to: BAR_VALUES[phase],
                durationSeconds: 1,
                persist: true,
            });
            state.setFlag('beelzebub_bar_init', true);
        }
    }

    private static onEntityHurt(ev: EntityHurtAfterEvent): void {
        const { damage, damageSource, hurtEntity } = ev;

        const attacker = damageSource.damagingEntity;
        if (attacker?.typeId !== 'minecraft:player') return;
        if (!PlayerState.for(attacker as Player).hasPower('beelzebub')) return;
        if (damageSource.cause !== EntityDamageCause.entityAttack) return;

        const player = attacker as Player;

        const now = Date.now();
        const lastHit = Beelzebub.lastHitTimes.get(player.id) ?? 0;
        if (now - lastHit < 150) return;
        Beelzebub.lastHitTimes.set(player.id, now);

        hurtEntity.addTag(`_beelzebub_target_${player.id}`);

        soulburst(player, hurtEntity);
        lifeDrain(player, hurtEntity);

        const phase = getBeelzebubPhase(player);
        ResourceBarService.push(player, {
            id: BAR_ID,
            from: BAR_VALUES[phase],
            to: BAR_VALUES[Math.min(phase + 1, 4)],
            durationSeconds: 1,
            persist: true,
        });

        incrementBeelzebubPhase(player, 1);
        incrementBeelzebubDmg(player, damage);

        const headLoc = player.getHeadLocation();
        const viewDir = player.getViewDirection();
        player.dimension.spawnParticle(`r4isen1920_originspe:voidwalker_beelzebub_phase_${phase}`, {
            x: headLoc.x + viewDir.x * 1.75,
            y: headLoc.y + viewDir.y * 1.75,
            z: headLoc.z + viewDir.z * 1.75,
        });

        // world.playSound('enchant.sweeping_edge.hit', hurtEntity.location, { volume: 0.75, pitch: 1.25 });

        const attackerHealth = player.getComponent('health') as any;
        if (attackerHealth) {
            const missingHealth = attackerHealth.effectiveMax - attackerHealth.currentValue;
            player.runCommand(`damage @e[tag="_beelzebub_target_${player.id}",c=1] ${Math.ceil(missingHealth)}`);
        }
    }
}