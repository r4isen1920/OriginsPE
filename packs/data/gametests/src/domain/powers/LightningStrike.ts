import { EntityDamageCause, Player, system, TicksPerSecond, Vector3 } from '@minecraft/server';
import { Power } from '../../core/abilities/Ability';
import { PlayerState } from '../../core/platform/PlayerState';
import { RegisterPower } from '../../core/abilities/Registries';
import { ResourceBarService } from '../../services/ResourceBarService';

const COOLDOWN_KEY = 'lightning_strike_cooldown';
const COOLDOWN_TICKS = TicksPerSecond * 15;
const COOLDOWN_BAR_ID = 27;
const INITIAL_RADIUS = 8;
const CHAIN_RADIUS = 5;
const LIGHTNING_DAMAGE = 4;
const MAX_CHAINS = 3;
const BEAM_PARTICLE_DENSITY = 8;
const CHAIN_DELAY_TICKS = 10;

@RegisterPower
export class LightningStrike implements Power {
    readonly id = 'lightning_strike';
    readonly icon = '27';

    readonly active = {
        icon: '27',
        name: 'origins.trait.lightning_strike.name',
        cooldownKey: COOLDOWN_KEY,
    };

    onActivate(player: Player): void {
        const state = PlayerState.for(player);
        const now = system.currentTick;

        if (state.isOnCooldown(COOLDOWN_KEY, now)) {
            player.playSound('note.bass', { volume: 1.0, pitch: 1.5 });
            return;
        }

        const initialTargets = player.dimension.getEntities({
            location: player.location,
            maxDistance: INITIAL_RADIUS,
            excludeFamilies: ['player', 'inanimate']
        });

        if (initialTargets.length === 0) {
            player.onScreenDisplay.setActionBar('§cNo entities nearby to strike!');
            player.playSound('note.bass', { volume: 0.5, pitch: 1.0 });
            return;
        }

        state.setCooldown(COOLDOWN_KEY, now, COOLDOWN_TICKS);

        ResourceBarService.push(player, {
            id: COOLDOWN_BAR_ID,
            durationSeconds: 15,
        });

        let currentSourceLoc: Vector3 = {
            x: player.location.x,
            y: player.location.y + 1.0,
            z: player.location.z
        };

        let currentTarget = initialTargets.reduce((closest, entity) => {
            const distClosest = this.getDistance(player.location, closest.location);
            const distEntity = this.getDistance(player.location, entity.location);
            return distEntity < distClosest ? entity : closest;
        });

        const hitEntityIds = new Set<string>();
        let chainCount = 0;

        const processChain = () => {
            if (!currentTarget || !currentTarget.isValid) return;

            hitEntityIds.add(currentTarget.id);

            currentTarget.applyDamage(LIGHTNING_DAMAGE, {
                cause: EntityDamageCause.contact,
                damagingEntity: player
            });

            const targetLoc = {
                x: currentTarget.location.x,
                y: currentTarget.location.y + 0.8,
                z: currentTarget.location.z
            };

            player.playSound('random.zap', {
                location: targetLoc,
                volume: 0.3,
                pitch: 1.4
            });

            for (let i = 0; i <= BEAM_PARTICLE_DENSITY; i++) {
                const t = i / BEAM_PARTICLE_DENSITY;
                const particleLoc = {
                    x: currentSourceLoc.x + (targetLoc.x - currentSourceLoc.x) * t,
                    y: currentSourceLoc.y + (targetLoc.y - currentSourceLoc.y) * t,
                    z: currentSourceLoc.z + (targetLoc.z - currentSourceLoc.z) * t
                };

                player.dimension.spawnParticle(
                    'r4isen1920_originspe:electric_chain_beam',
                    particleLoc
                );
            }

            if (chainCount >= MAX_CHAINS) return;

            const nextTargets = player.dimension.getEntities({
                location: currentTarget.location,
                maxDistance: CHAIN_RADIUS,
                excludeFamilies: ['player', 'inanimate']
            });

            let nextTarget = null;
            let closestDist = Infinity;

            for (const entity of nextTargets) {
                if (hitEntityIds.has(entity.id) || !entity.isValid) continue;

                const dist = this.getDistance(currentTarget.location, entity.location);
                if (dist < closestDist) {
                    closestDist = dist;
                    nextTarget = entity;
                }
            }

            if (nextTarget) {
                currentSourceLoc = targetLoc;
                currentTarget = nextTarget;
                chainCount++;
                system.runTimeout(processChain, CHAIN_DELAY_TICKS);
            }
        };

        processChain();
    }

    private getDistance(loc1: Vector3, loc2: Vector3): number {
        const dx = loc1.x - loc2.x;
        const dy = loc1.y - loc2.y;
        const dz = loc1.z - loc2.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
}