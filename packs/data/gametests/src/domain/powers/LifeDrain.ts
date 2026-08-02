import { Entity, EntityComponentTypes, EntityHealthComponent, EntityHurtAfterEvent, Player } from '@minecraft/server';
import { Logger } from '@bedrock-oss/bedrock-boost';
import { RegisterPower } from '../../core/abilities/Registries';
import { Power } from '../../core/abilities/Ability';
import { EntityUtils } from '../../utils/EntityUtils';

@RegisterPower
export class LifeDrain implements Power {
    private static readonly log = Logger.getLogger('OriginsPE', 'LifeDrain');

    readonly id = 'life_drain';

    onDealDamage(player: Player, ev: EntityHurtAfterEvent): void {
		const dmgEntity = ev.damageSource.damagingEntity;
        if (!(dmgEntity instanceof Player)) return;
        if (dmgEntity.id !== player.id) return;
        LifeDrain.applyLifeDrainReduction(player, ev.hurtEntity);
    }

    public static applyLifeDrainReduction(attacker: Player, hurtEntity: Entity): void {
        const attackerHealth = LifeDrain.readHealth(attacker);
        const hurtHealth = LifeDrain.readHealth(hurtEntity);
        if (!attackerHealth || !hurtHealth) {
            LifeDrain.log.debug(`Skipped due to missing health component. attacker: ${attacker.typeId}, target: ${hurtEntity.typeId}`);
            return;
        }

        const healthDecrement = Math.min(
            hurtHealth.effectiveMax - hurtHealth.currentValue,
            attackerHealth.effectiveMax * 0.5,
        );

        attackerHealth.setCurrentValue(
            Math.max(attackerHealth.currentValue - healthDecrement, 1),
        );
    }

    private static readHealth(entity: Entity): EntityHealthComponent | undefined {
        return EntityUtils.getComponent(entity, EntityComponentTypes.Health) as EntityHealthComponent | undefined;
    }
}