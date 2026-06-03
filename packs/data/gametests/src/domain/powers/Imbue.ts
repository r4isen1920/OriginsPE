import { Player, EntityDamageCause, ProjectileHitEntityAfterEvent } from '@minecraft/server';
import { RegisterPower } from '../Registries';
import { Power } from '../Ability';

/**
 * Imbue: the holder's arrows deal bonus magic damage, increased against undead.
 */

@RegisterPower
export class Imbue implements Power {
	readonly id = 'imbue';

	private static readonly UNDEAD_TYPES = new Set([
		'minecraft:zombie',
		'minecraft:zombie_villager',
		'minecraft:husk',
		'minecraft:drowned',
		'minecraft:skeleton',
		'minecraft:stray',
		'minecraft:wither_skeleton',
		'minecraft:phantom',
		'minecraft:zoglin',
		'minecraft:zombified_piglin',
		'minecraft:wither',
		'minecraft:bogged'
	]);

	onProjectileHit(player: Player, ev: ProjectileHitEntityAfterEvent): void {
		if (ev.projectile?.typeId !== 'minecraft:arrow') return;

		const hitInfo = ev.getEntityHit();
		const hurtEntity = hitInfo?.entity;
		if (!hurtEntity) return;

		const attackerHealthComp = player.getComponent('health');
		if (!attackerHealthComp) return;

		let additionalDamage = attackerHealthComp.currentValue * 0.5;

		const targetIsUndead = Imbue.UNDEAD_TYPES.has(hurtEntity.typeId);
		if (targetIsUndead) {
			const targetHealthComp = hurtEntity.getComponent('health');
			const targetMax = targetHealthComp ? targetHealthComp.effectiveMax : 20;
			additionalDamage += targetMax * 0.25;
		}

		const roundedDamage = Math.round(additionalDamage);
		if (roundedDamage <= 0) return;

		hurtEntity.applyDamage(roundedDamage, {
			cause: EntityDamageCause.magic,
			damagingEntity: player
		});

		const viewDirection = player.getViewDirection();
		const chargeParticleLocation = {
			x: player.location.x + viewDirection.x * 1.25,
			y: player.location.y + 1 + viewDirection.y * 1.25,
			z: player.location.z + viewDirection.z * 1.25
		};

		player.dimension.spawnParticle(
			'r4isen1920_originspe:elven_bow_charge',
			chargeParticleLocation
		);
		hurtEntity.dimension.spawnParticle('r4isen1920_originspe:elven_bow_impact', {
			x: hurtEntity.location.x,
			y: hurtEntity.location.y + 1,
			z: hurtEntity.location.z
		});

		player.dimension.playSound('ender_eye.dead', hurtEntity.location);
		player.dimension.playSound('ender_eye.dead', player.location);
	}
}
