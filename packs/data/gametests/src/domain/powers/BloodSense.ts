import { Player, EntityComponentTypes, system, world } from '@minecraft/server';
import { RegisterPower } from '../../core/abilities/Registries';
import { Power } from '../../core/abilities/Ability';
import { PlayerState } from '../../core/platform/PlayerState';

const SCAN_RANGE = 64;
const LOW_HP_THRESHOLD = 6;
const SCAN_INTERVAL_TICKS = 10;

const trackedTargets = new Map<string, Set<string>>();

const holderTargets = new Map<string, Set<string>>();

@RegisterPower
export class BloodSense implements Power {
	readonly id = 'blood_sense';
	readonly tickInterval = SCAN_INTERVAL_TICKS;

	onAcquire(player: Player): void {
		holderTargets.set(player.id, new Set());
	}

	onRelease(player: Player): void {
		BloodSense.clearAllFlags(player);
		holderTargets.delete(player.id);
	}

	onTick(player: Player): void {
		if (!player.isValid) return;
		if (!PlayerState.for(player).hasPower('blood_sense')) return;

		const myTargets = holderTargets.get(player.id);
		if (!myTargets) return;

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

			if (!myTargets.has(target.id)) {
				BloodSense.applyFlag(player, target);
				myTargets.add(target.id);

				if (!trackedTargets.has(target.id)) trackedTargets.set(target.id, new Set());
				trackedTargets.get(target.id)!.add(player.id);
			}
		}

		for (const targetId of [...myTargets]) {
			if (currentTargetIds.has(targetId)) continue;

			const target = world.getPlayers().find((p) => p.id === targetId);
			if (target) BloodSense.removeFlag(player, target);

			myTargets.delete(targetId);
			trackedTargets.get(targetId)?.delete(player.id);
		}
	}

	private static applyFlag(holder: Player, target: Player): void {
		system.runTimeout(
			() => {
				if (!holder.isValid || !target.isValid) return;
				if (!PlayerState.for(holder).hasPower('blood_sense')) return;

				(holder as any).setPropertyOverrideForEntity(
					target,
					'r4isen1920_originspe:flag_e',
					true
				);
			},
			Math.floor(Math.random() * 5)
		);
	}

	private static removeFlag(holder: Player, target: Player): void {
		if (!holder.isValid || !target.isValid) return;

		const holders = trackedTargets.get(target.id);
		const otherHolderStillTracking = holders && [...holders].some((id) => id !== holder.id);

		if (!otherHolderStillTracking) {
			(holder as any).setPropertyOverrideForEntity(
				target,
				'r4isen1920_originspe:flag_e',
				false
			);
		}
	}

	private static clearAllFlags(holder: Player): void {
		const myTargets = holderTargets.get(holder.id);
		if (!myTargets) return;

		for (const targetId of myTargets) {
			const target = world.getPlayers().find((p) => p.id === targetId);
			if (target) BloodSense.removeFlag(holder, target);
			trackedTargets.get(targetId)?.delete(holder.id);
		}

		myTargets.clear();
	}
}
