import { Vec3 } from '@bedrock-oss/bedrock-boost';
import { Entity, EntityComponent, EntityComponentReturnType, EntityComponentTypes, EntityRemoveAfterEvent, ItemStack, Player, PlayerInventoryItemChangeAfterEvent, PlayerLeaveAfterEvent, Vector3 } from '@minecraft/server';
import { AfterEntityRemove, AfterPlayerInventoryItemChange, AfterPlayerLeave } from '../core/platform/DecoratedEvents';



/**
 * Utility methods for working with entities and their components.
 * This class acts as a cache layer for entity methods.
 */
export class EntityUtils {


	//#region Component
	/** Cached component data in memory */
	private static readonly componentCache = new Map<string, Map<string, EntityComponent>>();

	/**
	 * Retrieves the component of the given entity.
	 *
	 * This method caches the component for future retrieval, and
	 * will return the cached version if it is still valid.
	 */
	static getComponent<T extends string>(
		entity: Entity,
		componentId: T
	): EntityComponentReturnType<T> | undefined {
		const byComponent = this.componentCache.get(entity.id);
		const cached = byComponent?.get(componentId);
		if (cached) {
			if (cached.isValid) return cached as EntityComponentReturnType<T>;
			byComponent!.delete(componentId);
		}

		const component = entity.getComponent(componentId);
		if (!component) return undefined;

		if (byComponent) {
			byComponent.set(componentId, component);
		} else {
			this.componentCache.set(entity.id, new Map([[componentId, component]]));
		}
		return component;
	}



	//#region Dyn. Property
	/** Cached dynamic property data in memory */
	private static readonly dynamicPropertyCache = new Map<string, Map<string, string | number | boolean | Vec3>>();

	/**
	 * Retrieves a dynamic property of the given entity.
	 *
	 * This method caches the value for future retrieval. `Vector3`
	 * values are converted into {@link Vec3} instances.
	 */
	static getDynamicProperty(
		entity: Entity,
		identifier: string
	): string | number | boolean | Vec3 | undefined {
		const byProperty = this.dynamicPropertyCache.get(entity.id);
		if (byProperty?.has(identifier)) return byProperty.get(identifier);

		const raw = entity.getDynamicProperty(identifier);
		if (raw === undefined) return undefined;
		const value = typeof raw === 'object' ? Vec3.from(raw) : raw;

		if (byProperty) {
			byProperty.set(identifier, value);
		} else {
			this.dynamicPropertyCache.set(entity.id, new Map([[identifier, value]]));
		}
		return value;
	}

	/**
	 * Sets a dynamic property of the given entity and updates the cache.
	 *
	 * `Vector3` values are stored as {@link Vec3} instances. Passing
	 * `undefined` clears the property and its cached value.
	 */
	static setDynamicProperty(
		entity: Entity,
		identifier: string,
		value?: string | number | boolean | Vector3
	): void {
		entity.setDynamicProperty(identifier, value);

		const byProperty = this.dynamicPropertyCache.get(entity.id);
		if (value === undefined) {
			byProperty?.delete(identifier);
			return;
		}

		const stored = typeof value === 'object' ? Vec3.from(value) : value;
		if (byProperty) {
			byProperty.set(identifier, stored);
		} else {
			this.dynamicPropertyCache.set(entity.id, new Map([[identifier, stored]]));
		}
	}



	//#region Inventory
	/** Cached inventory data in memory */
	private static readonly inventoryCache = new Map<string, Map<number, ItemStack>>();
	/** Player ids whose inventory has been seeded from the live container. */
	private static readonly seededInventories = new Set<string>();

	@AfterPlayerInventoryItemChange()
	private static __updateCache(event: PlayerInventoryItemChangeAfterEvent): void {
		const { itemStack, player, slot } = event;
		const bySlot = this.inventoryCache.get(player.id);

		if (bySlot && itemStack) {
			bySlot.set(slot, itemStack);
		}
		else if (!bySlot && itemStack) {
			this.inventoryCache.set(player.id, new Map([[slot, itemStack]]));
		}
		else if (bySlot && !itemStack) {
			bySlot?.delete(slot);
		}
	}

	/**
	 * Seeds the inventory cache from the live container on first access, so reads
	 * reflect the full inventory and not only slots changed since load.
	 */
	private static ensureInventorySeeded(player: Player): Map<number, ItemStack> | undefined {
		if (this.seededInventories.has(player.id)) return this.inventoryCache.get(player.id);

		const container = this.getComponent(player, EntityComponentTypes.Inventory)?.container;
		const bySlot = new Map<number, ItemStack>();
		if (container) {
			for (let i = 0; i < container.size; i++) {
				const item = container.getItem(i);
				if (item) bySlot.set(i, item);
			}
		}

		this.inventoryCache.set(player.id, bySlot);
		this.seededInventories.add(player.id);
		return bySlot;
	}

	/**
	 * Retrieves the item in the given player's inventory slot.
	 * This method retrieves the item from the cache.
	 * 
	 * **This method can only be used for the Player.**
	 * 
	 * @param player The player to get the item from.
	 * @param slot The inventory slot to get the item from.
	 * @returns
	 * The item in the given slot, or `undefined` if the slot is empty.
	 * The return type is an ItemStack, which represents the item in the slot.
	 */
	static getInventoryItem(player: Player, slot: number): ItemStack | undefined {
		return this.ensureInventorySeeded(player)?.get(slot);
	}

	/**
	 * Retrives the entire inventory of the given player.
	 * This method retrieves the inventory from the cache.
	 * 
	 * **This method can only be used for the Player.**
	 * 
	 * @param player The player to get the inventory from.
	 * @returns
	 * The entire inventory of the given player as an ItemStack mapped to its slot index.
	 * Empty slots are not included, so the map is empty when the player holds nothing.
	 */
	static getInventory(player: Player): Map<number, ItemStack> | undefined {
		return this.ensureInventorySeeded(player);
	}

}
