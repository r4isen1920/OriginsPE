import { EntityDamageCause, Player, EntityHealthComponent, system } from '@minecraft/server';
import { Power } from '../../core/abilities/Ability';
import { RegisterPower } from '../../core/abilities/Registries';
import { PlayerState } from '../../core/platform/PlayerState';

const AURA_RADIUS = 3;
const AURA_DAMAGE = 0.5;
const ZAP_VOLUME = 0.1;
const MIN_PITCH = 0.8;
const MAX_PITCH = 1.4;
const BEAM_PARTICLE_DENSITY = 6;
const TARGET_COOLDOWN_TICKS = 120;

const targetCooldowns = new Map<string, number>();

@RegisterPower
export class ElectricAura implements Power {
    readonly id = 'electric_aura';
    readonly tickInterval = 1;

    onTick(player: Player): void {
        if (!PlayerState.for(player).hasPower('electric_aura')) return;

        const now = system.currentTick;

        player.dimension.spawnParticle(
            'r4isen1920_originspe:electric_aura',
            player.location
        );

        const targets = player.dimension.getEntities({
            location: player.location,
            maxDistance: AURA_RADIUS,
            excludeFamilies: ['player', 'inanimate']
        });

        const startX = player.location.x;
        const startY = player.location.y + 1.0;
        const startZ = player.location.z;

        for (const entity of targets) {
            const nextAvailableHit = targetCooldowns.get(entity.id) ?? 0;
            if (now < nextAvailableHit) continue;

            const healthComponent = entity.getComponent('minecraft:health') as EntityHealthComponent | undefined;
            const startHealth = healthComponent ? healthComponent.currentValue : 0;

            entity.applyDamage(AURA_DAMAGE, {
                cause: EntityDamageCause.contact,
                damagingEntity: player
            });

            const endHealth = healthComponent ? healthComponent.currentValue : 0;

            if (startHealth > endHealth) {
                targetCooldowns.set(entity.id, now + TARGET_COOLDOWN_TICKS);

                const randomPitch = Math.random() * (MAX_PITCH - MIN_PITCH) + MIN_PITCH;

                player.playSound('random.zap', {
                    location: entity.location,
                    volume: ZAP_VOLUME,
                    pitch: randomPitch
                });

                const targetX = entity.location.x;
                const targetY = entity.location.y + 1.0;
                const targetZ = entity.location.z;

                for (let i = 0; i <= BEAM_PARTICLE_DENSITY; i++) {
                    const t = i / BEAM_PARTICLE_DENSITY;
                    const particleLoc = {
                        x: startX + (targetX - startX) * t,
                        y: startY + (targetY - startY) * t,
                        z: startZ + (targetZ - startZ) * t
                    };

                    player.dimension.spawnParticle(
                        'r4isen1920_originspe:electric_zap',
                        particleLoc
                    );
                }
            }
        }
    }
}