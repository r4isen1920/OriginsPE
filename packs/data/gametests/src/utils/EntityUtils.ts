import { Entity, Player } from '@minecraft/server';


/**
 * General utils for working with entities.
 * TODO: expand
 */
export class EntityUtils {
	/** Type guard for a player entity. */
	static isPlayer(entity: Entity | undefined): entity is Player {
		return entity?.typeId === 'minecraft:player';
	}

	/** Read a numeric component property safely. */
	static health(entity: Entity): number | undefined {
		const c = entity.getComponent('health');
		return c?.currentValue;
	}

	/**
	 * Returns the total brightness level (0-15) at the entity's location via
	 * {@link Block.getLightLevel}. Returns 0 if the block cannot be read.
	 */
	static getLightLevel(entity: Entity): number {
		try {
			return entity.dimension.getBlock(entity.location)?.getLightLevel() ?? 0;
		} catch {
			return 0;
		}
	}
}
