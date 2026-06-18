import { Player, TicksPerSecond } from '@minecraft/server';
import { Power } from '../Ability';
import { RegisterPower } from '../Registries';
import { PlayerState } from '../../core/PlayerState';
import { ResourceBarService } from '../../services/ResourceBarService';
import { system } from '@minecraft/server';


const COOLDOWN_KEY = 'hyper_leap_cooldown';
const STRESS_KEY = 'r4isen1920_originspe:stress';
const BAR_ID = 21;
const LEVITATION_FORCE = 10;
const KNOCKBACK_FORCE = 1.2;


/**
 * Launch yourself and nearby enemies into the air.
 * Cooldown is shorter when stress is high.
 */
@RegisterPower
export class HyperLeap implements Power {
    readonly id = 'hyper_leap';
    readonly icon = '21';

    readonly active = {
        icon: '21',
        name: 'origins.trait.hyper_leap.name',
        cooldownKey: COOLDOWN_KEY,
    };

    onActivate(player: Player): void {
        const state = PlayerState.for(player);
        const now = system.currentTick;

        if (state.isOnCooldown(COOLDOWN_KEY, now)) {
            player.playSound('note.bass', { volume: 1, pitch: 1.5 });
            return;
        }

        const currentStress = (player.getDynamicProperty(STRESS_KEY) as number) ?? 0;
        const cooldownSeconds = currentStress > 70 ? 1 : 3;
        const cooldownTicks = cooldownSeconds * 20;

        // Levitate nearby entities
        player.dimension.getEntities({
            location: player.location,
            maxDistance: 6,
            excludeFamilies: ['inanimate'],
        }).forEach(entity => {
            if (entity.id === player.id) return;
            entity.addEffect('levitation', TicksPerSecond * 1, {
                amplifier: LEVITATION_FORCE,
                showParticles: false,
            });
        });

        // Launch player
        const viewDir = player.getViewDirection();
        player.applyKnockback(
            { x: viewDir.x, z: viewDir.z },
            KNOCKBACK_FORCE,
        );

        // Particles
        player.dimension.spawnParticle('r4isen1920_originspe:star_leap_base', {
            x: player.location.x,
            y: player.location.y + 0.5,
            z: player.location.z,
        });
        player.dimension.spawnParticle('r4isen1920_originspe:star_leap_stars', {
            x: player.location.x,
            y: player.location.y + 0.5,
            z: player.location.z,
        });

        // Sounds
        player.dimension.playSound('origins.starborne.leap', player.location);
        player.playSound('origins.starborne.leap_direct');

        // Cooldown + bar
        state.setCooldown(COOLDOWN_KEY, now, cooldownTicks);

        ResourceBarService.push(player, {
            id: BAR_ID,
            durationSeconds: cooldownSeconds,
        });
    }
}