import { Vec3 } from '@bedrock-oss/bedrock-boost';
import { Entity, EntityComponent, EntityComponentReturnType, Vector3 } from '@minecraft/server';



/**
 * Utility methods for working with entities and their components.
 * This class acts as a cache layer for entity methods.
 */
export class EntityUtils {
	private static readonly componentCache = new Map<string, Map<string, EntityComponent>>();
	private static readonly dynamicPropertyCache = new Map<string, Map<string, string | number | boolean | Vec3>>();


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
}
