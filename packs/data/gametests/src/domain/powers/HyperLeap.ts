import { Player, TicksPerSecond } from '@minecraft/server';
import { Power } from '../../core/abilities/Ability';
import { RegisterPower } from '../../core/abilities/Registries';
import { PlayerState } from '../../core/platform/PlayerState';
import { ResourceBarService } from '../../services/ResourceBarService';
import { system } from '@minecraft/server';
import { Vec3 } from '@bedrock-oss/bedrock-boost';
import { MinecraftEffectTypes } from '@minecraft/vanilla-data';


const COOLDOWN_KEY = 'hyper_leap_cooldown';
const STRESS_KEY = 'r4isen1920_originspe:stress';
const BAR_ID = 21;
const LEVITATION_FORCE = 10;
const KNOCKBACK_FORCE = 3.4;


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

        player.dimension.getEntities({
            location: player.location,
            maxDistance: 6,
            excludeFamilies: ['inanimate'],
        }).forEach(entity => {
            if (entity.id === player.id) return;
            entity.addEffect(MinecraftEffectTypes.Levitation, TicksPerSecond * 1, {
                amplifier: LEVITATION_FORCE,
                showParticles: false,
            });
        });

		const viewDir = Vec3.from(player.getViewDirection()); 

		const VERTICAL_MULTIPLIER = 1.5;
		const BASE_LIFT = 0.6;

		let impulseY = (viewDir.y * KNOCKBACK_FORCE * VERTICAL_MULTIPLIER) + BASE_LIFT;
		impulseY = Math.max(impulseY, BASE_LIFT); // surely they at least get the minimum hop
		const impulse = new Vec3(
			viewDir.x * KNOCKBACK_FORCE,
			impulseY,
			viewDir.z * KNOCKBACK_FORCE
		);

		player.applyImpulse(impulse);

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

        player.dimension.playSound('origins.starborne.leap', player.location);
        player.playSound('origins.starborne.leap_direct');

        state.setCooldown(COOLDOWN_KEY, now, cooldownTicks);

        ResourceBarService.push(player, {
            id: BAR_ID,
            durationSeconds: cooldownSeconds,
        });
    }
}