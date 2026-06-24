import { EntityDamageCause, Player, EntityHealthComponent } from '@minecraft/server';
import { Power } from '../../core/abilities/Ability';
import { RegisterPower } from '../../core/abilities/Registries';
import { PlayerState } from '../../core/platform/PlayerState';

const AURA_RADIUS = 3;
const AURA_DAMAGE = 0.5;
const ZAP_VOLUME = 0.1;
const MIN_PITCH = 0.8;
const MAX_PITCH = 1.4;

@RegisterPower
export class ElectricAura implements Power {
    readonly id = 'electric_aura';
    readonly tickInterval = 1;

    onTick(player: Player): void {
        if (!PlayerState.for(player).hasPower('electric_aura')) return;

        player.dimension.spawnParticle(
            'r4isen1920_originspe:electric_aura',
            player.location
        );

        const targets = player.dimension.getEntities({
            location: player.location,
            maxDistance: AURA_RADIUS,
            excludeFamilies: ['player', 'inanimate']
        });

        for (const entity of targets) {
            const healthComponent = entity.getComponent('minecraft:health') as EntityHealthComponent | undefined;
            const startHealth = healthComponent ? healthComponent.currentValue : 0;

            entity.applyDamage(AURA_DAMAGE, {
                cause: EntityDamageCause.contact,
                damagingEntity: player
            });

            const endHealth = healthComponent ? healthComponent.currentValue : 0;

            if (startHealth > endHealth) {
                const randomPitch = Math.random() * (MAX_PITCH - MIN_PITCH) + MIN_PITCH;

                player.playSound('random.zap', {
                    location: entity.location,
                    volume: ZAP_VOLUME,
                    pitch: randomPitch
                });

                player.dimension.spawnParticle(
                    'minecraft:sparkler_rocket_particle',
                    entity.location
                );
            }
        }
    }
}