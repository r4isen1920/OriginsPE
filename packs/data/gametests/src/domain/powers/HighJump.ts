import {
	Player,
	system,
	TicksPerSecond,
	EntityQueryOptions,
	EntityDamageCause
} from '@minecraft/server';

import { Power } from '../../core/abilities/Ability';
import { PlayerState } from '../../core/platform/PlayerState';
import { RegisterPower } from '../../core/abilities/Registries';
import { ResourceBarService } from '../../services/ResourceBarService';

@RegisterPower
export class HighJump implements Power {
	readonly id = 'high_jump';
	readonly icon = '07';
	readonly tickInterval = 2;

	readonly active = {
		icon: '07',
		name: 'origins.trait.high_jump.name',
		cooldownKey: HighJump.COOLDOWN_KEY
	};

	private static readonly COOLDOWN_BAR_ID = 7;
	private static readonly COOLDOWN_KEY = 'high_jump';
	private static readonly COOLDOWN_TICKS = TicksPerSecond * 5;
	private static readonly IMPACT_RADIUS = 4;
	private static readonly IMPACT_DAMAGE = 6;
	private static readonly KNOCKBACK_STRENGTH = 2.0;

	onActivate(player: Player): void {
		const state = PlayerState.for(player);
		const now = system.currentTick;

		if (state.isOnCooldown(HighJump.COOLDOWN_KEY, now)) {
			player.playSound('note.bass', { volume: 1.0, pitch: 1.5 });
			return;
		}

		const fragLevel = Number(state.getFlag<number>('fragmentation_level') ?? 3);
		const launchForce = fragLevel === 3 ? 1.5 : fragLevel === 2 ? 1.2 : 1.0;

		player.applyImpulse({ x: 0, y: launchForce, z: 0 });
		state.setFlag('high_jump_launched', true);

		player.dimension.playSound('mob.slime.big', player.location, { volume: 1, pitch: 0.8 });
	}

	onTick(player: Player): void {
		const state = PlayerState.for(player);
		if (state.getFlag<boolean>('high_jump_launched') !== true) return;
		if (!player.isOnGround) return;

		const now = system.currentTick;
		const fragLevel = Number(state.getFlag<number>('fragmentation_level') ?? 3);
		fragLevel === 3
			? player.applyDamage(2, { cause: EntityDamageCause.fall })
			: fragLevel === 2
				? player.applyDamage(1, { cause: EntityDamageCause.fall })
				: null;

		state.setFlag('high_jump_launched', false);
		state.setCooldown(HighJump.COOLDOWN_KEY, now, HighJump.COOLDOWN_TICKS);
		ResourceBarService.push(player, {
			id: HighJump.COOLDOWN_BAR_ID,
			durationSeconds: 5
		});

		const query: EntityQueryOptions = {
			location: player.location,
			maxDistance: HighJump.IMPACT_RADIUS,
			excludeTypes: ['minecraft:player']
		};

		const nearby = player.dimension.getEntities(query);
		for (const entity of nearby) {
			if (!entity.isValid) continue;

			const dx = entity.location.x - player.location.x;
			const dz = entity.location.z - player.location.z;
			const dist = Math.sqrt(dx * dx + dz * dz) || 1;

			const falloff = 1 - dist / HighJump.IMPACT_RADIUS;
			const hForce = HighJump.KNOCKBACK_STRENGTH * falloff;

			if (entity.hasComponent('minecraft:health')) {
				entity.applyKnockback({ x: dx / dist, z: dz / dist }, hForce);
			}

			entity.applyDamage(HighJump.IMPACT_DAMAGE * falloff, {
				cause: EntityDamageCause.entityAttack,
				damagingEntity: player
			});
		}

		player.dimension.playSound('mob.slime.big', player.location, { volume: 1.5, pitch: 0.7 });
	}

	onRelease(player: Player): void {
		PlayerState.for(player).setFlag('high_jump_launched', false);
	}
}
