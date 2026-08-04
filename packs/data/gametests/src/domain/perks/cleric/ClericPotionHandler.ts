import {
	Dimension,
	Entity,
	EntityComponentTypes,
	EntityRemoveAfterEvent,
	EntitySpawnAfterEvent,
	ItemCompleteUseAfterEvent,
	ItemUseBeforeEvent,
	MolangVariableMap,
	Player,
	ProjectileHitBlockAfterEvent,
	ProjectileHitEntityAfterEvent,
	system,
	Vector3,
	world,
} from '@minecraft/server';
import { MinecraftDimensionTypes } from '@minecraft/vanilla-data';

import { Entities, EntityProperties, Particles } from '../../../Files';
import {
	AfterEntityRemove,
	AfterEntitySpawn,
	AfterItemCompleteUse,
	AfterProjectileHitBlock,
	AfterProjectileHitEntity,
	BeforeItemUse,
} from '../../../core/platform/DecoratedEvents';
import { Tick, PlayerTick } from '../../../core/platform/Ticker';
import { EntityUtils, Log } from '../../../utils';

import ClericPotionUtils, { ClericPotionRef, ClericTier } from './ClericPotionUtils';



/**
 * This class is part of the Cleric's perk system.
 * 
 * This in particular manages how the Cleric's potions are applied to the player and other entities.
 */
export default class ClericPotionHandler {
	private static readonly log = Log.get('ClericPotionHandler');


	//#region Tuning

	/** Matches vanilla's splash application radius. */
	private static readonly SPLASH_RADIUS = 4.0;

	private static readonly CLOUD_POTION = 'cleric_cloud_potion';
	private static readonly CLOUD_TIER = 'cleric_cloud_tier';
	private static readonly CLOUD_SPAWNED = 'cleric_cloud_spawned';

	/** Excluded so a potion never applies its effect to itself or to another cloud. */
	private static readonly EXCLUDED_FAMILIES = ['inanimate'];

	private static readonly DIMENSIONS = [
		MinecraftDimensionTypes.Overworld,
		MinecraftDimensionTypes.Nether,
		MinecraftDimensionTypes.TheEnd,
	];


	//#region State

	/**
	 * Throws awaiting their projectile. `itemUse` and `entitySpawn` both fire on
	 * the same tick, so this is only ever populated for the span between them.
	 */
	private static readonly pendingThrows = new Map<string, ClericPotionRef>();

	/** Live projectiles, so impact never has to read from an entity being removed. */
	private static readonly inFlight = new Map<string, ClericPotionRef>();


	//#region Drinking

	@AfterItemCompleteUse
	static onDrink(ev: ItemCompleteUseAfterEvent): void {
		const ref = ClericPotionUtils.resolveItem(ev.itemStack.typeId);
		if (!ref || ref.delivery.throwable) return;

		ClericPotionUtils.applyTo(ev.source, ref);
		ev.source.dimension.playSound('bottle.empty', ev.source.location);

		this.log.info(`Drank ${ev.itemStack.typeId}: ${ev.source.name}`);
	}


	//#region Tooltips

	/**
	 * Backfills the effect summary on any Cleric potion that lacks one.
	 *
	 * BrewingService describes the potions it converts, but an item can also
	 * arrive from creative, a command or another player's hand, and a custom
	 * item inherits none of vanilla's potion tooltip. Lore is only ever written
	 * by us, so a non-empty lore means the item is already described.
	 */
	@PlayerTick(20)
	static describeCarried(player: Player): void {
		const container = EntityUtils.getComponent(player, EntityComponentTypes.Inventory)?.container;
		if (!container) return;

		const inventory = EntityUtils.getInventory(player);
		if (!inventory) return;

		for (const [slot, item] of inventory) {
			if (item.getRawLore().length > 0) continue;

			const ref = ClericPotionUtils.resolveItem(item.typeId);
			if (!ref) continue;

			ClericPotionUtils.decorate(item, ref);
			container.setItem(slot, item);
		}
	}


	//#region Throwing

	/**
	 * Records which potion is being thrown, before the projectile exists.
	 *
	 * This has to run on the before-event: the projectile component spawns the
	 * entity during use processing, so `entitySpawn` fires ahead of `itemUse`
	 * and would otherwise read the previous throw.
	 */
	@BeforeItemUse
	static onItemUse(ev: ItemUseBeforeEvent): void {
		const ref = ClericPotionUtils.resolveItem(ev.itemStack.typeId);
		if (!ref || !ref.delivery.throwable) return;

		this.pendingThrows.set(ev.source.id, ref);
	}

	/**
	 * Stamps the freshly spawned projectile with the potion it came from.
	 *
	 * The actor property exists purely so the render controller can pick a
	 * bottle texture; client Molang cannot see dynamic properties. Gameplay
	 * reads from {@link inFlight} instead.
	 */
	@AfterEntitySpawn
	static onEntitySpawn(ev: EntitySpawnAfterEvent): void {
		const { entity } = ev;
		if (entity.typeId !== Entities.ClericSplashPotion && entity.typeId !== Entities.ClericLingeringPotion) return;

		const owner = entity.getComponent(EntityComponentTypes.Projectile)?.owner;
		if (!owner) return;

		const ref = this.pendingThrows.get(owner.id);
		if (!ref) return;

		this.pendingThrows.delete(owner.id);
		this.inFlight.set(entity.id, ref);

		try {
			entity.setProperty(EntityProperties.ClericSplashPotion.Potion, ref.index);
		} catch (e: any) {
			this.log.error(`Failed to stamp projectile ${entity.typeId}: `, e);
		}
	}

	@AfterEntityRemove
	static onEntityRemove(ev: EntityRemoveAfterEvent): void {
		this.inFlight.delete(ev.removedEntityId);
	}


	//#region Impact

	@AfterProjectileHitBlock
	static onHitBlock(ev: ProjectileHitBlockAfterEvent): void {
		this.onImpact(ev.projectile, ev.dimension, ev.location);
	}

	@AfterProjectileHitEntity
	static onHitEntity(ev: ProjectileHitEntityAfterEvent): void {
		this.onImpact(ev.projectile, ev.dimension, ev.location);
	}

	private static onImpact(projectile: Entity, dimension: Dimension, location: Vector3): void {
		const ref = this.inFlight.get(projectile.id);
		if (!ref) return;

		this.inFlight.delete(projectile.id);

		if (ref.delivery.id === 'lingering_potion') this.spawnCloud(dimension, location, ref);
		else this.splash(dimension, location, ref);
	}

	/** Applies the brew to everything in range and plays the burst. */
	private static splash(dimension: Dimension, location: Vector3, ref: ClericPotionRef): void {
		this.spawnParticle(dimension, location, Particles.ClericPotionSplash, ref);

		const targets = dimension.getEntities({
			location,
			maxDistance: this.SPLASH_RADIUS,
			excludeFamilies: this.EXCLUDED_FAMILIES,
		});

		for (const target of targets) ClericPotionUtils.applyTo(target, ref);
		this.log.info(`Splash ${ref.potion.id} (${ref.tier.tier}) hit ${targets.length} entities`);
	}


	//#region Lingering cloud

	/**
	 * Spawns the cloud marker and records its identity on the entity itself.
	 *
	 * Persisting to dynamic properties rather than an in-memory map is what lets
	 * a cloud survive a world reload, which the old `minecraft:timer` did for
	 * free and a naive script port would have silently lost.
	 */
	private static spawnCloud(dimension: Dimension, location: Vector3, ref: ClericPotionRef): void {
		try {
			const cloud = dimension.spawnEntity(Entities.ClericAreaEffectCloud, location);

			cloud.setProperty(EntityProperties.ClericAreaEffectCloud.Potion, ref.index);
			cloud.setDynamicProperty(this.CLOUD_POTION, ref.index);
			cloud.setDynamicProperty(this.CLOUD_TIER, ref.tier.tier);
			cloud.setDynamicProperty(this.CLOUD_SPAWNED, system.currentTick);

			this.spawnParticle(dimension, location, Particles.ClericPotionLingering, ref);
			this.log.info(`Cloud spawned: ${ref.potion.id} (${ref.tier.tier})`);
		} catch (e: any) {
			this.log.error('Failed to spawn lingering cloud: ', e);
		}
	}

	/**
	 * Advances every live cloud, applying its effect at the current stage radius.
	 *
	 * The interval is inlined rather than read from a static field because member
	 * decorators are evaluated before the class binding exists.
	 */
	@Tick(20)
	static tickClouds(): void {
		const { stages, stage_ticks } = ClericPotionUtils.cloud;
		const lifetime = stages.length * stage_ticks;

		for (const dimensionId of this.DIMENSIONS) {
			let dimension: Dimension;
			try {
				dimension = world.getDimension(dimensionId);
			} catch {
				continue;
			}

			for (const cloud of dimension.getEntities({ type: Entities.ClericAreaEffectCloud })) {
				const spawned = cloud.getDynamicProperty(this.CLOUD_SPAWNED);
				if (typeof spawned !== 'number') {
					// Orphaned by a failed spawn; nothing can be recovered from it.
					cloud.remove();
					continue;
				}

				const elapsed = system.currentTick - spawned;
				if (elapsed >= lifetime) {
					cloud.remove();
					continue;
				}

				const ref = this.refOf(cloud);
				if (!ref) continue;

				const stage = stages[Math.min(stages.length - 1, Math.floor(elapsed / stage_ticks))];
				const targets = cloud.dimension.getEntities({
					location: cloud.location,
					maxDistance: stage.radius,
					excludeFamilies: this.EXCLUDED_FAMILIES,
				});

				for (const target of targets) ClericPotionUtils.applyTo(target, ref);
			}
		}
	}

	/** Reconstructs a cloud's brew from the properties stored on it. */
	private static refOf(cloud: Entity): ClericPotionRef | undefined {
		const index = cloud.getDynamicProperty(this.CLOUD_POTION);
		const tier = cloud.getDynamicProperty(this.CLOUD_TIER);
		if (typeof index !== 'number' || typeof tier !== 'string') return undefined;

		return ClericPotionUtils.refFor(index, tier as ClericTier, 'lingering_potion');
	}


	//#region Particles

	/** Spawns a shared emitter tinted to the potion, replacing the old per-effect files. */
	private static spawnParticle(dimension: Dimension, location: Vector3, particle: string, ref: ClericPotionRef): void {
		const molang = new MolangVariableMap();
		molang.setColorRGB('color', ClericPotionUtils.colorOf(ref.potion));

		try {
			dimension.spawnParticle(particle, location, molang);
		} catch (e: any) {
			this.log.error(`Failed to spawn particle '${particle}': `, e);
		}
	}
}
