import {
	Player,
	Entity,
	EntityHitEntityAfterEvent,
	EntityComponentTypes,
	system,
	world,
	Vector3
} from '@minecraft/server';
import { RegisterPower } from '../../core/abilities/Registries';
import { Power } from '../../core/abilities/Ability';
import { PlayerState } from '../../core';
import { ResourceBarService } from '../../services/ResourceBarService';

const BLEED_EXPIRY_KEY = 'rapture:bleed_expiry_tick';
const BLEED_SOURCE_KEY = 'rapture:source_player_id';
const BLEED_DRAINED_KEY = 'rapture:total_drained';

const HIT_COUNT_FLAG = 'rapture:hit_count';
const HITS_REQUIRED = 5;

const BLEED_DAMAGE_PER_TICK = 0.5;
const BLEED_MAX_DRAIN = 3;
const BLEED_DURATION_TICKS = Math.ceil(BLEED_MAX_DRAIN / BLEED_DAMAGE_PER_TICK) * 4;

const COOLDOWN_KEY = 'rapture_cooldown';
const COOLDOWN_TICKS = 400;
const EXPIRY_FLAG = 'rapture_expiry';
const RESOURCE_BAR_ID = 28;

const BLEED_PARTICLE = 'r4isen1920_originspe:bleeding';
const SUCK_STEPS = 6;
const HURT_FLASH_INTERVAL = 20;

const DIMENSIONS = ['minecraft:overworld', 'minecraft:nether', 'minecraft:the_end'];

system.runInterval(() => {
	Rapture.tickAllBleeding();
}, 4);

@RegisterPower
export class Rapture implements Power {
	readonly id = 'rapture';

	onRelease(player: Player): void {
		PlayerState.for(player).setFlag(HIT_COUNT_FLAG, 0);
		ResourceBarService.pop(player, RESOURCE_BAR_ID);
	}

	onAttack(player: Player, ev: EntityHitEntityAfterEvent): void {
		const state = PlayerState.for(player);
		const currentTick = system.currentTick;

		if (state.isOnCooldown(COOLDOWN_KEY, currentTick)) return;

		const target = ev.hitEntity;
		if (!target?.isValid) return;
		if (!target.getComponent(EntityComponentTypes.Health)) return;

		const hits = (state.getFlag<number>(HIT_COUNT_FLAG) ?? 0) + 1;

		if (hits < HITS_REQUIRED) {
			state.setFlag(HIT_COUNT_FLAG, hits);
			return;
		}

		state.setFlag(HIT_COUNT_FLAG, 0);

		const expiryTick = currentTick + BLEED_DURATION_TICKS;
		target.setDynamicProperty(BLEED_EXPIRY_KEY, expiryTick);
		target.setDynamicProperty(BLEED_SOURCE_KEY, player.id);
		target.setDynamicProperty(BLEED_DRAINED_KEY, 0);

		state.setCooldown(COOLDOWN_KEY, currentTick, COOLDOWN_TICKS);
		state.setFlag(EXPIRY_FLAG, currentTick + COOLDOWN_TICKS);

		ResourceBarService.push(player, {
			id: RESOURCE_BAR_ID,
			durationSeconds: 20,
			from: 100,
			to: 0
		});
	}

	static tickAllBleeding(): void {
		const currentTick = system.currentTick;

		for (const dimId of DIMENSIONS) {
			let dimension;
			try {
				dimension = world.getDimension(dimId);
			} catch {
				continue;
			}

			const bleeding = dimension
				.getEntities()
				.filter(
					(e) =>
						e.getDynamicProperty(BLEED_EXPIRY_KEY) !== undefined &&
						e.getDynamicProperty(BLEED_EXPIRY_KEY) !== 0
				);

			for (const entity of bleeding) {
				if (!entity.isValid) continue;

				const expiryTick = entity.getDynamicProperty(BLEED_EXPIRY_KEY) as
					| number
					| undefined;
				if (expiryTick === undefined) continue;

				const totalDrained =
					(entity.getDynamicProperty(BLEED_DRAINED_KEY) as number | undefined) ?? 0;

				if (currentTick >= expiryTick || totalDrained >= BLEED_MAX_DRAIN) {
					entity.setDynamicProperty(BLEED_EXPIRY_KEY, 0);
					entity.setDynamicProperty(BLEED_DRAINED_KEY, 0);
					entity.setDynamicProperty(BLEED_SOURCE_KEY, undefined);
					continue;
				}

				// --- Damage tick ---
				const healthComp = entity.getComponent(EntityComponentTypes.Health);
				if (!healthComp) continue;

				const actual = Math.min(
					BLEED_DAMAGE_PER_TICK,
					Math.max(0, healthComp.currentValue - 1)
				);
				if (actual > 0) {
					healthComp.setCurrentValue(healthComp.currentValue - actual);
					entity.setDynamicProperty(BLEED_DRAINED_KEY, totalDrained + actual);

					const sourceId = entity.getDynamicProperty(BLEED_SOURCE_KEY) as
						| string
						| undefined;
					if (sourceId) {
						this.applyLifeSteal(sourceId, actual, entity.dimension.id);
					}
				}

				if (currentTick % HURT_FLASH_INTERVAL === 0) {
					entity.applyDamage(0);
				}

				// --- Suck particles: lerp from entity toward vampire ---
				const sourceId = entity.getDynamicProperty(BLEED_SOURCE_KEY) as string | undefined;
				const vampirePlayer = sourceId
					? (dimension
							.getEntities({ type: 'minecraft:player' })
							.find((e) => e.id === sourceId) as Player | undefined)
					: undefined;

				if (vampirePlayer?.isValid) {
					this.spawnSuckParticles(entity, vampirePlayer, entity.dimension.id);
				}
			}
		}
	}

	private static spawnSuckParticles(entity: Entity, vampire: Player, dimensionId: string): void {
		let dimension;
		try {
			dimension = world.getDimension(dimensionId);
		} catch {
			return;
		}

		const from = entity.location;
		const to = vampire.location;

		const toAdjusted: Vector3 = {
			x: to.x,
			y: to.y + 1.0,
			z: to.z
		};

		for (let i = 0; i < SUCK_STEPS; i++) {
			const t = 0.1 + (i / (SUCK_STEPS - 1)) * 0.85;

			const spawnPos: Vector3 = {
				x: from.x + (toAdjusted.x - from.x) * t,
				y: from.y + 1.0 + (toAdjusted.y - (from.y + 1.0)) * t,
				z: from.z + (toAdjusted.z - from.z) * t
			};

			dimension.spawnParticle(BLEED_PARTICLE, spawnPos);
		}
	}

	private static applyLifeSteal(
		sourcePlayerId: string,
		amount: number,
		dimensionId: string
	): void {
		let dimension;
		try {
			dimension = world.getDimension(dimensionId);
		} catch {
			return;
		}

		const source = dimension
			.getEntities({ type: 'minecraft:player' })
			.find((e) => e.id === sourcePlayerId) as Player | undefined;
		if (!source?.isValid) return;

		const healthComp = source.getComponent(EntityComponentTypes.Health);
		if (!healthComp) return;

		const healed = Math.min(healthComp.currentValue + amount, healthComp.defaultValue);
		healthComp.setCurrentValue(healed);
	}
}
