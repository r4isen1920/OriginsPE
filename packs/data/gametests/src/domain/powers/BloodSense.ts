import { Player, Entity, EntityComponentTypes, system, world } from '@minecraft/server';
import { RegisterPower } from '../../core/abilities/Registries';
import { Power } from '../../core/abilities/Ability';
import { PlayerState } from '../../core/platform/PlayerState';

const HIGHLIGHT_ENTITY = 'r4isen1920_originspe:player_highlight';
const SCAN_RANGE = 64;
const LOW_HP_THRESHOLD = 6;
const SCAN_INTERVAL_TICKS = 10;

const activeHighlights = new Map<string, Map<string, Entity>>();

@RegisterPower
export class BloodSense implements Power {
	readonly id = 'blood_sense';
	readonly tickInterval = SCAN_INTERVAL_TICKS;

	onAcquire(player: Player): void {
		activeHighlights.set(player.id, new Map());
	}

	onRelease(player: Player): void {
		BloodSense.clearAllHighlights(player.id);
		activeHighlights.delete(player.id);
	}

	onTick(player: Player): void {
		if (!player.isValid) return;

		if (!PlayerState.for(player).hasPower('blood_sense')) return;

		const holderMap = activeHighlights.get(player.id);
		if (!holderMap) return;

		const currentTargetIds = new Set<string>();

		for (const target of world.getPlayers()) {
			if (!target.isValid || target.id === player.id) continue;
			if (target.dimension.id !== player.dimension.id) continue;

			const dx = target.location.x - player.location.x;
			const dy = target.location.y - player.location.y;
			const dz = target.location.z - player.location.z;
			if (dx * dx + dy * dy + dz * dz > SCAN_RANGE * SCAN_RANGE) continue;

			const healthComp = target.getComponent(EntityComponentTypes.Health);
			if (!healthComp || healthComp.currentValue > LOW_HP_THRESHOLD) continue;

			currentTargetIds.add(target.id);

			if (holderMap.has(target.id)) {
				const existingEntity = holderMap.get(target.id)!;
				if (existingEntity.isValid) {
					existingEntity.teleport(target.location);
				} else {
					holderMap.delete(target.id);
					BloodSense.spawnHighlight(player, target, holderMap);
				}
				continue;
			}

			BloodSense.spawnHighlight(player, target, holderMap);
		}

		for (const [targetId, entity] of [...holderMap.entries()]) {
			if (currentTargetIds.has(targetId)) continue;
			if (entity.isValid) entity.remove();
			holderMap.delete(targetId);
		}
	}

	private static spawnHighlight(
		holder: Player,
		target: Player,
		holderMap: Map<string, Entity>
	): void {
		const targetId = target.id;

		system.runTimeout(
			() => {
				if (!holder.isValid || !target.isValid) return;
				if (!PlayerState.for(holder).hasPower('blood_sense')) return;

				const entity = holder.dimension.spawnEntity(HIGHLIGHT_ENTITY, {
					x: target.location.x,
					y: target.location.y,
					z: target.location.z
				});

				(holder as any).setPropertyOverrideForEntity(
					entity,
					'r4isen1920_originspe:is_visible',
					true
				);

				holderMap.set(targetId, entity);
			},
			Math.floor(Math.random() * 5)
		);
	}

	private static clearAllHighlights(holderId: string): void {
		const holderMap = activeHighlights.get(holderId);
		if (!holderMap) return;

		for (const entity of holderMap.values()) {
			if (entity.isValid) entity.remove();
		}
		holderMap.clear();
	}
}
