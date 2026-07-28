import {
	Dimension,
	Entity,
	EntityDamageCause,
	ItemStack,
	Player,
	system,
	TicksPerSecond,
	Vector3
} from '@minecraft/server';
import { Power } from '../../core/abilities/Ability';
import { PlayerState } from '../../core/platform/PlayerState';
import { RegisterPower } from '../../core/abilities/Registries';
import { ResourceBarService } from '../../services/ResourceBarService';

const COOLDOWN_KEY = 'wrath_of_olympus_cooldown';
const COOLDOWN_SECONDS = 30;
const COOLDOWN_TICKS = TicksPerSecond * COOLDOWN_SECONDS;
const COOLDOWN_BAR_ID = 31;

const MAX_RAY_DISTANCE = 40;
const FALLBACK_STRIKE_DISTANCE = 12;
const TRIDENT_SPAWN_HEIGHT = 20;
const STRIKE_DELAY_TICKS = TicksPerSecond * 1;
const EXPLOSION_RADIUS = 7;
const EXPLOSION_DAMAGE = 20;
const EXPLOSION_KNOCKBACK = 0.9;

@RegisterPower
export class WrathOfOlympus implements Power {
	readonly id = 'wrath_of_olympus';
	readonly icon = '31';

	readonly active = {
		icon: '31',
		name: 'origins.trait.wrath_of_olympus.name'
	};

	onActivate(player: Player): void {
		const state = PlayerState.for(player);
		const now = system.currentTick;

		if (state.isOnCooldown(COOLDOWN_KEY, now)) {
			player.playSound('note.bass', { volume: 1.0, pitch: 1.5 });
			return;
		}

		const targetLocation = this.getTargetLocation(player);

		state.setCooldown(COOLDOWN_KEY, now, COOLDOWN_TICKS);

		ResourceBarService.push(player, {
			id: COOLDOWN_BAR_ID,
			durationSeconds: COOLDOWN_SECONDS
		});

		this.spawnDescendingTrident(player, targetLocation);
	}

	private getTargetLocation(player: Player): Vector3 {
		const headLocation = player.getHeadLocation();
		const viewDirection = player.getViewDirection();

		const blockRaycast = player.dimension.getBlockFromRay(headLocation, viewDirection, {
			maxDistance: MAX_RAY_DISTANCE,
			includeLiquidBlocks: true,
			includePassableBlocks: false
		});

		if (blockRaycast) {
			return {
				x: blockRaycast.block.location.x + 0.5,
				y: blockRaycast.block.location.y + 1,
				z: blockRaycast.block.location.z + 0.5
			};
		}

		return {
			x: headLocation.x + viewDirection.x * FALLBACK_STRIKE_DISTANCE,
			y: headLocation.y + viewDirection.y * FALLBACK_STRIKE_DISTANCE,
			z: headLocation.z + viewDirection.z * FALLBACK_STRIKE_DISTANCE
		};
	}

	private spawnDescendingTrident(player: Player, targetLocation: Vector3): void {
		const dimension = player.dimension;
		const spawnLoc: Vector3 = {
			x: targetLocation.x,
			y: targetLocation.y + TRIDENT_SPAWN_HEIGHT,
			z: targetLocation.z
		};

		dimension.spawnParticle('r4isen1920_originspe:electric_chain_beam', spawnLoc);
		player.playSound('item.trident.throw', { location: spawnLoc, volume: 1.0, pitch: 0.7 });

		const tridentItemEntity = dimension.spawnItem(new ItemStack('minecraft:trident'), spawnLoc);

		const totalSteps = STRIKE_DELAY_TICKS;
		let currentStep = 0;

		const descendIntervalId = system.runInterval(() => {
			currentStep++;

			if (!tridentItemEntity.isValid) {
				system.clearRun(descendIntervalId);
				return;
			}

			const t = currentStep / totalSteps;
			const nextLoc: Vector3 = {
				x: spawnLoc.x + (targetLocation.x - spawnLoc.x) * t,
				y: spawnLoc.y + (targetLocation.y - spawnLoc.y) * t,
				z: spawnLoc.z + (targetLocation.z - spawnLoc.z) * t
			};

			tridentItemEntity.teleport(nextLoc);
			dimension.spawnParticle('r4isen1920_originspe:electric_chain_beam', nextLoc);

			if (currentStep >= totalSteps) {
				system.clearRun(descendIntervalId);
				this.strikeImpact(player, targetLocation, tridentItemEntity);
			}
		}, 1);
	}

	private strikeImpact(player: Player, location: Vector3, tridentEntity?: Entity): void {
    const dimension = player.dimension;

    if (tridentEntity?.isValid) {
        tridentEntity.remove();
    }

    const IMMUNITY_TICKS = TicksPerSecond * 2;
    player.addEffect('resistance', IMMUNITY_TICKS, {
        amplifier: 255,
        showParticles: false,
    });

    dimension.spawnEntity('minecraft:lightning_bolt', location);

    dimension.createExplosion(location, EXPLOSION_RADIUS, {
        breaksBlocks: true,
        causesFire: false,
        source: player,
    });

    player.playSound('random.explode', { location, volume: 1.0, pitch: 0.8 });

    const nearbyEntities = dimension.getEntities({
        location,
        maxDistance: EXPLOSION_RADIUS,
        excludeTypes: ['minecraft:item'],
    });

    for (const entity of nearbyEntities) {
        if (!entity.isValid || entity.id === player.id) continue; 

        const dist = this.getDistance(location, entity.location);
        if (dist > EXPLOSION_RADIUS) continue;

        const falloff = 1 - dist / EXPLOSION_RADIUS;
        const damage = Math.max(1, Math.round(EXPLOSION_DAMAGE * falloff));

        entity.applyDamage(damage, {
            cause: EntityDamageCause.lightning,
            damagingEntity: player,
        });

        if (!entity.isValid) continue;
        if (!entity.hasComponent('minecraft:health')) continue;

        const dx = entity.location.x - location.x;
        const dz = entity.location.z - location.z;
        const horizontalDist = Math.max(0.1, Math.sqrt(dx * dx + dz * dz));
        entity.applyKnockback(
            { x: (dx / horizontalDist) * EXPLOSION_KNOCKBACK, z: (dz / horizontalDist) * EXPLOSION_KNOCKBACK },
            0.5
        );
    }

    system.runTimeout(() => {
        if (player.isValid) {
            player.removeEffect('resistance');
        }
    }, IMMUNITY_TICKS);
}

	private getDistance(loc1: Vector3, loc2: Vector3): number {
		const dx = loc1.x - loc2.x;
		const dy = loc1.y - loc2.y;
		const dz = loc1.z - loc2.z;
		return Math.sqrt(dx * dx + dy * dy + dz * dz);
	}
}
