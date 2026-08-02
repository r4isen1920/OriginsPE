import {
    EntityComponentTypes,
    EntityHurtAfterEvent,
    Player,
} from '@minecraft/server';
import { Logger } from '@bedrock-oss/bedrock-boost';

import { Power } from '../../core/abilities/Ability';
import { RegisterPower } from '../../core/abilities/Registries';
import { PlayerState } from '../../core/platform/PlayerState';
import { PlayerTick } from '../../core/platform/Ticker';
import { ResourceBarService } from '../../services/ResourceBarService';
import { Soulburst } from './SoulBurst';
import { EntityUtils } from '../../utils/EntityUtils';


const BAR_ID = 19;
const BAR_VALUES = [0, 29, 71, 100];


/**
 * Beelzebub applies bonus melee damage from missing health and builds Soulburst stacks.
 */
@RegisterPower
export class Beelzebub implements Power {
    private static readonly log = Logger.getLogger('OriginsPE', 'Beelzebub');

    readonly id = 'beelzebub';
    readonly icon = '19';

    onRelease(player: Player): void {
        Soulburst.resetBeelzebubPhase(player);
        PlayerState.for(player).setFlag('beelzebub_bar_init', undefined);
        ResourceBarService.pop(player, BAR_ID);
        Beelzebub.log.info(`Released for player: ${player.name}`);
    }

    @PlayerTick(3)
    static onPlayerTick(player: Player): void {
        if (!PlayerState.for(player).hasPower('beelzebub')) return;

        const state = PlayerState.for(player);
        if (!state.getFlag<boolean>('beelzebub_bar_init')) {
            const phase = Soulburst.getBeelzebubPhase(player);
            ResourceBarService.push(player, {
                id: BAR_ID,
                from: BAR_VALUES[phase],
                to: BAR_VALUES[phase],
                durationSeconds: 1,
                persist: true,
            });
            state.setFlag('beelzebub_bar_init', true);
            Beelzebub.log.info(`Initialized bar for player: ${player.name}, phase: ${phase}`);
        }
    }

    onDealDamage(player: Player, ev: EntityHurtAfterEvent): void {
        const { damage, damageSource, hurtEntity } = ev;
        if (damage <= 0) return;

		const dmgEntity = damageSource.damagingEntity;
        if (!(dmgEntity instanceof Player)) return;
        if (dmgEntity.id !== player.id) return;
        if (damageSource.cause !== 'entityAttack') return;

        const health = EntityUtils.getComponent(player, EntityComponentTypes.Health);
        if (!health) {
            Beelzebub.log.warn(`No health component for player: ${player.name}`);
            return;
        }

        const missingHealth = Math.max(0, health.effectiveMax - health.currentValue);
        if (missingHealth > 0) {
            hurtEntity.applyDamage(Math.ceil(missingHealth));
        }

        const phase = Soulburst.getBeelzebubPhase(player);
        const nextPhase = Math.min(phase + 1, 3);

        ResourceBarService.push(player, {
            id: BAR_ID,
            from: BAR_VALUES[phase],
            to: BAR_VALUES[nextPhase],
            durationSeconds: 1,
            persist: true,
        });

        Soulburst.incrementBeelzebubPhase(player, 1);

        const headLoc = player.getHeadLocation();
        const viewDir = player.getViewDirection();
        player.dimension.spawnParticle(`r4isen1920_originspe:voidwalker_beelzebub_phase_${phase}`, {
            x: headLoc.x + viewDir.x * 1.75,
            y: headLoc.y + viewDir.y * 1.75,
            z: headLoc.z + viewDir.z * 1.75,
        });

        if (nextPhase >= 3 && PlayerState.for(player).hasPower('soulburst')) {
            Soulburst.triggerSoulburst(player, hurtEntity);
            ResourceBarService.push(player, {
                id: BAR_ID,
                from: BAR_VALUES[3],
                to: BAR_VALUES[0],
                durationSeconds: 1,
                persist: true,
            });
            Beelzebub.log.info(`Soulburst triggered for player: ${player.name}`);
        }
    }
}