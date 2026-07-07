import {
	EntityComponentTypes,
	EntityDamageCause,
	Entity,
	Player,
	ProjectileHitEntityAfterEvent,
	system,
} from '@minecraft/server';
import { RegisterPower } from '../../core/abilities/Registries';
import { Power } from '../../core/abilities/Ability';
import { Entities, Particles } from '../../Files';



/**
 * Imbued Shots: bow hits call down a delayed follow-up orb attack.
 */
@RegisterPower
export class Imbue implements Power {
	readonly id = 'imbued_shots';
	private static readonly TARGET_PROC_COOLDOWN_TICKS = 4;
	private static readonly ORBIT_TICKS = 8;
	private static readonly FLIGHT_TICKS = 10;
	private static readonly ORBIT_RADIUS = 1.15;
	private static readonly ORBIT_HEIGHT = 1.05;
	private static readonly ARC_HEIGHT = 2.2;
	private static readonly targetProcTick = new Map<string, number>();

	onProjectileHit(player: Player, event: ProjectileHitEntityAfterEvent): void {
		if (event.projectile?.typeId !== Entities.Arrow) return;

		const hurtEntity = event.getEntityHit()?.entity;
		if (!hurtEntity) return;

		const now = system.currentTick;
		const procKey = `${player.id}:${hurtEntity.id}`;
		const lastProc = Imbue.targetProcTick.get(procKey) ?? -9999;
		if (now - lastProc < Imbue.TARGET_PROC_COOLDOWN_TICKS) return;
		Imbue.targetProcTick.set(procKey, now);

		const attackerHealthComp = player.getComponent(EntityComponentTypes.Health);
		if (!attackerHealthComp) return;

		const additionalDamage = attackerHealthComp.currentValue;

		if (additionalDamage <= 0) return;

		player.playSound('ender_eye.dead', {
			volume: 1.0,
			pitch: 0.8,
		});
		this.launchOrb(player, hurtEntity, additionalDamage);
	}

	private launchOrb(player: Player, target: Entity, damage: number): void {
		const orbitSeed = Math.random() * Math.PI * 2;
		const departure = { x: 0, y: 0, z: 0 };
		let current = this.orbitPosition(player, orbitSeed, 0);
		let age = 0;

		this.spawnOrb(player, current);

		const orbRunId = system.runInterval(() => {
			age++;

			if (!player.isValid || !target.isValid || player.dimension.id !== target.dimension.id) {
				system.clearRun(orbRunId);
				return;
			}

			if (age <= Imbue.ORBIT_TICKS) {
				current = this.orbitPosition(player, orbitSeed, age);
				departure.x = current.x;
				departure.y = current.y;
				departure.z = current.z;
				this.spawnOrb(player, current);
				return;
			}

			const flightAge = age - Imbue.ORBIT_TICKS;
			const progress = Math.min(1, flightAge / Imbue.FLIGHT_TICKS);
			const targetPoint = {
				x: target.location.x,
				y: target.location.y + 0.9,
				z: target.location.z,
			};
			const control = {
				x: (departure.x + targetPoint.x) / 2,
				y: Math.max(departure.y, targetPoint.y) + Imbue.ARC_HEIGHT,
				z: (departure.z + targetPoint.z) / 2,
			};

			current = this.quadraticBezier(departure, control, targetPoint, progress);
			this.spawnOrb(player, current);

			if (progress < 1) return;

			target.applyDamage(damage, {
				cause: EntityDamageCause.magic,
				damagingEntity: player,
			});

			target.dimension.spawnParticle(Particles.ElvenArrowImpact, {
				x: target.location.x,
				y: target.location.y + 1,
				z: target.location.z,
			});
			target.dimension.playSound('ender_eye.dead', target.location, {
				volume: 1.0,
				pitch: 1.2,
			});

			player.playSound('ender_eye.dead', {
				volume: 1.0,
				pitch: 1.2,
			});
			system.clearRun(orbRunId);
		}, 1);
	}

	private orbitPosition(player: Player, orbitSeed: number, tick: number): { x: number; y: number; z: number } {
		const center = player.location;
		const angle = orbitSeed + (tick * 0.8);
		return {
			x: center.x + Math.cos(angle) * Imbue.ORBIT_RADIUS,
			y: center.y + Imbue.ORBIT_HEIGHT + (Math.sin(tick * 0.5) * 0.18),
			z: center.z + Math.sin(angle) * Imbue.ORBIT_RADIUS,
		};
	}

	private quadraticBezier(
		start: { x: number; y: number; z: number },
		control: { x: number; y: number; z: number },
		end: { x: number; y: number; z: number },
		progress: number,
	): { x: number; y: number; z: number } {
		const inverse = 1 - progress;
		return {
			x: (inverse * inverse * start.x) + (2 * inverse * progress * control.x) + (progress * progress * end.x),
			y: (inverse * inverse * start.y) + (2 * inverse * progress * control.y) + (progress * progress * end.y),
			z: (inverse * inverse * start.z) + (2 * inverse * progress * control.z) + (progress * progress * end.z),
		};
	}

	private spawnOrb(player: Player, location: { x: number; y: number; z: number }): void {
		player.dimension.spawnParticle(Particles.ElvenArrowTrail, location);
	}
}
