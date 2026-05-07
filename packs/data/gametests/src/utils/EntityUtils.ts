import { Entity, Player } from '@minecraft/server';


/**
 * Static helpers around Entity / Player that don't fit elsewhere.
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
}
