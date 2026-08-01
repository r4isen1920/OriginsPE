import {
    Block,
    Dimension,
    ExplosionAfterEvent,
    ExplosionBeforeEvent,
    Player,
    ProjectileHitBlockAfterEvent,
    system,
    Vector3,
    BlockPermutation,
    Entity,
    Container,
    EntityInventoryComponent,
    ItemStack,
    ItemLockMode,
    ProjectileHitEntityAfterEvent,
	TicksPerSecond,
	EntityComponentTypes,
	world
} from '@minecraft/server';
import { Power } from '../../core/abilities/Ability';
import { PlayerState } from '../../core/platform/PlayerState';
import { RegisterPower } from '../../core/abilities/Registries';
import { ResourceBarService } from '../../services/ResourceBarService';
import { SeveredConnection } from './SeveredConnection';
import { Log } from '../../utils';
import OverheadText from '../../ui/OverheadText';
import { AfterProjectileHitBlock, AfterProjectileHitEntity, BeforeExplosion, AfterWorldLoad, Ticker } from '../../core';
import { Entities, Items } from '../../Files';
import { MinecraftBlockTypes, MinecraftEntityTypes } from '@minecraft/vanilla-data';
import { Vec3 } from '@bedrock-oss/bedrock-boost';



@RegisterPower
export class WrathOfOlympus implements Power {
	readonly id = 'wrath_of_olympus';
	readonly icon = '31';

	readonly active = {
		icon: '31',
		name: 'origins.trait.wrath_of_olympus.name'
	};


	private static readonly log = Log.get('WrathOfOlympus');
	private static readonly COOLDOWN_KEY = 'wrath_of_olympus_cooldown';

	/** Persisted flag holding the slot index of an in-progress cast, so it can be resolved after a reload. */
	private static readonly CAST_SLOT_FLAG = 'wrath_of_olympus_cast_slot';
	/** Dynamic property on the storage entity identifying its owning player. */
	private static readonly STORAGE_OWNER_DP = 'wrath_of_olympus:owner_id';
	/** Dynamic property marking an inventory_keep entity as a Wrath of Olympus stash. */
	private static readonly STORAGE_MARKER_DP = 'wrath_of_olympus:is_stash';

	private static readonly IGNORED_TRANSFORM_BLOCKS = new Set<string>([
		MinecraftBlockTypes.Bamboo,
		MinecraftBlockTypes.Bush,
		MinecraftBlockTypes.CaveVines,
		MinecraftBlockTypes.CaveVinesBodyWithBerries,
		MinecraftBlockTypes.CaveVinesHeadWithBerries,
		MinecraftBlockTypes.Cocoa,
		MinecraftBlockTypes.Deadbush,
		MinecraftBlockTypes.FireflyBush,
		MinecraftBlockTypes.LeafLitter,
		MinecraftBlockTypes.PinkPetals,
		MinecraftBlockTypes.Reeds,
		MinecraftBlockTypes.RoseBush,
		MinecraftBlockTypes.ShortDryGrass,
		MinecraftBlockTypes.ShortGrass,
		MinecraftBlockTypes.SweetBerryBush,
		MinecraftBlockTypes.TallDryGrass,
		MinecraftBlockTypes.TallGrass,
		MinecraftBlockTypes.TwistingVines,
		MinecraftBlockTypes.Vine,
		MinecraftBlockTypes.WeepingVines,
		MinecraftBlockTypes.Wildflowers,
		MinecraftBlockTypes.WitherRose,
	]);


	private static activeDummyBlocks: ActiveDummyBlock[] = [];
	private static activeCasts: Map<string, ActiveCastState> = new Map();
	private static blockTrackerIntervalId?: number;
	private static castTrackerIntervalId?: number;


	//#region Config
	/**
	 * The multiplier applied to the base directional vector when pushing the dummy blocks away from the explosion center.
	 * The higher the value, the faster and further the blocks will be launched outward.
	 */
	static readonly EXPLOSION_FORCE_MULTIPLIER = 1.25;
	/**
	 * The flat vertical velocity added to the impulse vector of each dummy block.
	 * The higher the value, the steeper the upward arc of the blocks, preventing them from sliding horizontally across the ground.
	 */
	static readonly EXPLOSION_UPWARD_LIFT = 1.75;
	/**
	 * The number of physical blocks transformed into dummy entities per server tick.
	 * The higher the value, the faster the visual explosion forms, but setting it too high may cause noticeable server lag spikes.
	 */
	static readonly BLOCKS_PROCESSED_PER_TICK = 50;
	/**
	 * The minimum number of ticks a dummy block must exist before it is allowed to land and revert to a solid block.
	 * The higher the value, the longer blocks are forced to fly, preventing them from instantly snapping back into place before clearing the crater.
	 */
	static readonly MIN_FLIGHT_TICKS = 10;
	/**
	 * The maximum number of ticks a dummy block can exist before it is forcibly reverted to a solid block.
	 * The higher the value, the longer blocks can fall down cliffs or bounce, but keeping it reasonable prevents orphaned entities from existing infinitely if they get stuck.
	 */
	static readonly MAX_FLIGHT_TICKS = 200;


	//#region Casting

	onActivate(player: Player): void {
		if (!SeveredConnection.canCallLightning(player)) {
			OverheadText.show(player, 'origins.trait.wrath_of_olympus.no_sky');
			player.playSound('note.bass', { volume: 0.5, pitch: 1.0 });
			return;
		}

		const state = PlayerState.for(player);
		const now = system.currentTick;

		if (state.isOnCooldown(WrathOfOlympus.COOLDOWN_KEY, now)) {
			player.playSound('note.bass', { volume: 1.0, pitch: 1.5 });
			return;
		}

		// Prevent multiple triggers if they are already in the cast sequence
		if (WrathOfOlympus.activeCasts.has(player.id)) return;

		const inventory = player.getComponent(EntityComponentTypes.Inventory);
		const container = inventory?.container;
		if (!container) return;

		const selectedSlot = player.selectedSlotIndex;
		const currentItem = container.getItem(selectedSlot);

		// Stash the original item natively in a persistent entity so it survives a reload.
		WrathOfOlympus.stashItem(player, currentItem);

		const trident = new ItemStack(Items.ZeusTrident, 1);
		trident.lockMode = ItemLockMode.inventory; // Cannot be moved, dropped, or crafted

		container.setItem(selectedSlot, trident);

		// Persist the cast slot so the cast can be resolved even if the in-memory map is lost.
		state.setFlag(WrathOfOlympus.CAST_SLOT_FLAG, selectedSlot);

		WrathOfOlympus.activeCasts.set(player.id, {
			player,
			slotIndex: selectedSlot
		});
		WrathOfOlympus.startCastTracker();
	}

	/**
	 * Begins tracking the state of active casts, checking for slot changes
	 * or item removal to resolve the cast appropriately.
	 * 
	 * This method shares a single interval for all active casts.
	 * If one is already started, it will not start another.
	 * The interval will automatically stop when there are no more active casts to track,
	 * and restart when a new cast is initiated.
	 */
	private static startCastTracker(): void {
		if (this.castTrackerIntervalId !== undefined) return;

		this.castTrackerIntervalId = system.runInterval(() => {
			if (this.activeCasts.size === 0) {
				system.clearRun(this.castTrackerIntervalId!);
				this.castTrackerIntervalId = undefined;
				return;
			}

			for (const [playerId, castData] of this.activeCasts.entries()) {
				const { player, slotIndex } = castData;

				if (!player.isValid) {
					this.activeCasts.delete(playerId);
					continue;
				}

				const currentSlotIndex = player.selectedSlotIndex;
				const inventory = player.getComponent(EntityComponentTypes.Inventory);
				const container = inventory?.container;
				if (!container) continue;

				const itemInOriginalSlot = container.getItem(slotIndex);

				//* player changed their hotbar slot
				if (currentSlotIndex !== slotIndex) {
					this.resolveCast(player, castData, container, true);
					OverheadText.show(player, 'origins.trait.wrath_of_olympus.cast_cancel');
					continue;
				}

				//* item in slot is no longer the Trident
				if (!itemInOriginalSlot || itemInOriginalSlot.typeId !== Items.ZeusTrident) {
					this.resolveCast(player, castData, container, false);
					continue;
				}

				OverheadText.show(player, 'origins.trait.wrath_of_olympus.cast_begin');
			}
		});
	}

	/**
	 * Applies this abilities' cd to the player, and pushes the resource bar for display.
	 * @param player The player to apply the cooldown to.
	 * @param isForfeit 
	 * Determines whether the cooldown is applied for a successful cast or a forfeited cast.
	 * If not successful, the cooldown is shorter to allow the player to try again sooner.
	 */
	private static applyCooldown(player: Player, isForfeit: boolean = false): void {
		const state = PlayerState.for(player);
		const durationSeconds = (!isForfeit ? 30 : 5);
		// const durationSeconds = 1;
		const cooldownTicks = durationSeconds * TicksPerSecond;

		state.setCooldown(WrathOfOlympus.COOLDOWN_KEY, system.currentTick, cooldownTicks);
		ResourceBarService.push(player, {
			id: 31,
			durationSeconds,
		});
	}

	/**
	 * Resolves the cast state for a player, determined whether it was successful or forfeited.
	 * 
	 * @param player The player whose cast is being resolved. 
	 * @param castData The cast state data associated with the player.
	 * @param container The container of the player.
	 * @param isForfeit
	 * Whether or not the cast was 'forfeited':
	 * - A cast is considered **forfeited** if the player changed their hotbar slot during the cast sequence.
	 * - A cast is considered **successful** if the player actually used the Trident item and threw it.
	 */
	private static resolveCast(
		player: Player,
		castData: ActiveCastState,
		container: Container,
		isForfeit: boolean
	): void {
		this.activeCasts.delete(player.id);
		PlayerState.for(player).setFlag(this.CAST_SLOT_FLAG, undefined);

		const itemInSlot = container.getItem(castData.slotIndex);
		if (itemInSlot?.typeId === Items.ZeusTrident) {
			container.setItem(castData.slotIndex, undefined);
		}

		const stashedItem = this.retrieveStashedItem(player);
		if (stashedItem) {
			container.setItem(castData.slotIndex, stashedItem);
		}

		if (isForfeit) {
			player.playSound('note.bass', { volume: 1.0, pitch: 1.0 });
		}

		this.applyCooldown(player, isForfeit);
	}


	//#region Persistence

	/**
	 * Stashes the player's original held item inside a persistent `inventory_keep` entity.
	 * The entity's native inventory survives world reloads without any manual serialization.
	 */
	private static stashItem(player: Player, item: ItemStack | undefined): void {
		// Clear out any orphaned stash from a previously interrupted cast.
		this.findStorageEntity(player)?.remove();

		const entity = player.dimension.spawnEntity(Entities.InventoryKeep, player.location);
		entity.setDynamicProperty(this.STORAGE_OWNER_DP, player.id);
		entity.setDynamicProperty(this.STORAGE_MARKER_DP, true);

		if (item) {
			const inventory = entity.getComponent(EntityComponentTypes.Inventory);
			inventory?.container?.setItem(0, item);
		}

		this.log.info(`Stashed original item for player: ${player.name}, id: ${entity.id}`);
	}

	/**
	 * Pulls the stashed item back out of the player's storage entity and removes the entity.
	 * Returns `undefined` if no stash exists or the original slot was empty.
	 */
	private static retrieveStashedItem(player: Player): ItemStack | undefined {
		const entity = this.findStorageEntity(player);
		if (!entity) return undefined;

		const inventory = entity.getComponent(EntityComponentTypes.Inventory);
		const item = inventory?.container?.getItem(0);

		entity.remove();

		DEBUG: {
			if (item) {
				this.log.info(`Retrieved stashed item for player: ${player.name}, item: ${item.typeId}`);
			} else {
				this.log.info(`No stashed item found for player: ${player.name}`);
			}
		}

		return item;
	}

	/** Finds this player's stash entity across all loaded dimensions, if one exists. */
	private static findStorageEntity(player: Player): Entity | undefined {
		const seen = new Set<string>();
		const dims = [
			player.dimension,
			world.getDimension('overworld'),
			world.getDimension('nether'),
			world.getDimension('the_end')
		];
		for (const dim of dims) {
			if (seen.has(dim.id)) continue;
			seen.add(dim.id);
			const entity = dim
				.getEntities({ type: Entities.InventoryKeep })
				.find(e =>
					e.getDynamicProperty(this.STORAGE_OWNER_DP) === player.id &&
					e.getDynamicProperty(this.STORAGE_MARKER_DP) === true
				);
			if (entity) return entity;
		}
		return undefined;
	}

	/**
	 * Rebuilds in-memory cast state after a reload, using the persisted cast slot flag.
	 * Without this, a reloaded cast would fall through to the failed-cast path and the
	 * stashed item would never be reunited with an active cast for slot-change forfeits.
	 */
	@AfterWorldLoad
	static rehydrateActiveCasts(): void {
		system.runTimeout(() => {
			for (const player of Ticker.getPlayers()) {
				if (!player.isValid) continue;

				const slot = PlayerState.for(player).getFlag<number>(this.CAST_SLOT_FLAG);
				if (slot === undefined) continue;

				this.activeCasts.set(player.id, { player, slotIndex: slot });
				this.log.info(`Rehydrated active cast for player: ${player.name}, slot: ${slot}`);
			}

			if (this.activeCasts.size > 0) this.startCastTracker();
		}, TicksPerSecond);
	}


	//#region Explosion Phys.

	@AfterProjectileHitEntity
	@AfterProjectileHitBlock
	static onTridentImpact(event: ProjectileHitBlockAfterEvent | ProjectileHitEntityAfterEvent): void {
		const { projectile, source, dimension } = event;
		if (
			!(source instanceof Player) ||
			!PlayerState.for(source).hasPower('wrath_of_olympus') ||
			projectile.typeId !== Entities.ZeusTridentThrown
		)
			return;

		const inventory = source.getComponent('inventory') as EntityInventoryComponent;
		const container = inventory?.container;

		//* Sucessful cast
		if (WrathOfOlympus.activeCasts.has(source.id)) {
			const castData = WrathOfOlympus.activeCasts.get(source.id)!;
			if (container) {
				WrathOfOlympus.resolveCast(source, castData, container, false);

				dimension.spawnEntity(MinecraftEntityTypes.LightningBolt, projectile.location);

				dimension.playSound('item.trident.thunder', source.location, {
					pitch: 1.1,
				});
				source.playSound('item.trident.thunder', { pitch: 1.1 });
			}
		}

		//* Faile cast & edge-case
		else {
			if (container) {
				// sweeping the inventory is generally not performant,
				// but this is the most reliable way of preventing exploits
				// this is because native methods will only search with ItemStack instance object,
				// which may not exactly match at all times
				for (let i = 0; i < container.size; i++) {
					const item = container.getItem(i);
					if (item?.typeId === Items.ZeusTrident) {
						container.setItem(i, undefined);
					}
				}

				// Recover an item stashed by a cast whose in-memory state was lost (e.g. across a reload).
				const stashedItem = WrathOfOlympus.retrieveStashedItem(source);
				if (stashedItem) {
					const state = PlayerState.for(source);
					const slot = state.getFlag<number>(WrathOfOlympus.CAST_SLOT_FLAG) ?? source.selectedSlotIndex;
					container.setItem(slot, stashedItem);
				}
				PlayerState.for(source).setFlag(WrathOfOlympus.CAST_SLOT_FLAG, undefined);
			}
			WrathOfOlympus.applyCooldown(source);
		}

		projectile.triggerEvent('r4isen1920_originspe:explode');
	}

	@BeforeExplosion
	static onTridentExplosion(event: ExplosionBeforeEvent): void {
		const { source, dimension } = event;
		if (!source || source.typeId !== Entities.ZeusTridentThrown) return;

		const origin = source.location;
		const blocks = event.getImpactedBlocks();

		/**
		 * @private
		 * Func generator to process the impacted blocks in batches.
		 * Each batch is yielded and sliced into across different ticks to lighten load and impact on server.
		 */
		function* transformBlocks(): Generator<void, void, void> {
			let count = 0;
			const airPermutation = BlockPermutation.resolve('minecraft:air');

			let now = system.currentTick;
			for (const block of blocks) {
				const dummyRecord = WrathOfOlympus.transformIntoBlockEntity(
					block,
					dimension,
					origin
				);

				if (dummyRecord) {
					WrathOfOlympus.activeDummyBlocks.push(dummyRecord);
					WrathOfOlympus.startBlockTracker();
				}

				// Form the crater manually
				block.setPermutation(airPermutation);

				count++;
				if (count % WrathOfOlympus.BLOCKS_PROCESSED_PER_TICK === 0) {
					yield;
				}
			}
			yield;
			WrathOfOlympus.log.info(`Explosion, affected: ${blocks.length}, took ${system.currentTick - now} ticks`);
		}

		system.runJob(transformBlocks());
		event.setImpactedBlocks([]); 
	}

	/**
	 * Internal helper for transforming a block instance into a dummy entity.
	 * Transforming it into an Entity allows us to apply physics and impulses to it, simulating a realistic explosion effect.
	 */
	private static transformIntoBlockEntity(
		block: Block,
		dimension: Dimension,
		origin: Vector3
	): ActiveDummyBlock | null {
		if (this.IGNORED_TRANSFORM_BLOCKS.has(block.typeId)) return null;

		const item = block.getItemStack();
		if (!item) return null;

		const permutation = block.permutation;
		const location = block.center();
		const entity = dimension.spawnEntity(Entities.FloatingBlock, location);


		//? EntityEquippableComponent does not work on players atm
		entity.runCommand(`replaceitem entity @s slot.weapon.mainhand 0 ${item.typeId} 1 0`);


		const dx = location.x - origin.x;
		const dy = location.y - origin.y;
		const dz = location.z - origin.z;
		const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

		if (distance > 0) {
			const impulseVector: Vector3 = {
				x: (dx / distance) * WrathOfOlympus.EXPLOSION_FORCE_MULTIPLIER,
				y:
					(dy / distance) * WrathOfOlympus.EXPLOSION_FORCE_MULTIPLIER +
					WrathOfOlympus.EXPLOSION_UPWARD_LIFT,
				z: (dz / distance) * WrathOfOlympus.EXPLOSION_FORCE_MULTIPLIER
			};
			entity.applyImpulse(impulseVector);
		}

		return {
			entity,
			permutation,
			spawnTick: system.currentTick
		};
	}

	private static startBlockTracker(): void {
		if (this.blockTrackerIntervalId !== undefined) return;

		this.blockTrackerIntervalId = system.runInterval(() => {
			if (this.activeDummyBlocks.length === 0) {
				system.clearRun(this.blockTrackerIntervalId!);
				this.blockTrackerIntervalId = undefined;
				return;
			}

			const currentTick = system.currentTick;

			for (let i = this.activeDummyBlocks.length - 1; i >= 0; i--) {
				const dummy = this.activeDummyBlocks[i];

				if (!dummy.entity.isValid) {
					this.activeDummyBlocks.splice(i, 1);
					continue;
				}

				const lifespan = currentTick - dummy.spawnTick;
				if (lifespan < this.MIN_FLIGHT_TICKS) continue;

				const velocity = dummy.entity.getVelocity();
				const isStationary =
					Math.abs(velocity.x) < 0.01 &&
					Math.abs(velocity.y) < 0.01 &&
					Math.abs(velocity.z) < 0.01;

				if (dummy.entity.isOnGround || isStationary || lifespan > this.MAX_FLIGHT_TICKS) {
					const loc = Vec3.from(dummy.entity.location);
					const dim = dummy.entity.dimension;

					dummy.entity.remove();
					this.activeDummyBlocks.splice(i, 1);

					// Place the block back down
					const targetBlock = dim.getBlock({
						x: Math.floor(loc.x),
						y: Math.floor(loc.y),
						z: Math.floor(loc.z)
					});

					if (targetBlock) {
						if (targetBlock.isAir || targetBlock.isLiquid) {
							targetBlock.setPermutation(dummy.permutation);
						} else {
							const blockAbove = targetBlock.above();
							if (blockAbove && (blockAbove.isAir || blockAbove.isLiquid)) {
								blockAbove.setPermutation(dummy.permutation);
							}
						}

						if (Math.random() < 0.25) {
							dim.spawnEntity(MinecraftEntityTypes.LightningBolt, loc.up().up());
						}
					}
				}
			}
		});
	}
}



//#region Types
/** Represents a falling block state. */
interface ActiveDummyBlock {
	/** The dummy entity representing the falling block. */
    entity: Entity;
	/** The block permutation represented by this dummy entity. */
    permutation: BlockPermutation;
	/** The tick at which this dummy entity was spawned. */
    spawnTick: number;
}

/** Represents the state of an active cast. */
interface ActiveCastState {
    /** The player who initiated the cast. */
    player: Player;
    /** The inventory slot index associated with the cast. */
    slotIndex: number;
}
