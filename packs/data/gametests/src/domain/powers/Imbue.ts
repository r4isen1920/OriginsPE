import { Player, EntityDamageCause, ProjectileHitEntityAfterEvent } from '@minecraft/server';
import { RegisterPower } from '../../core/abilities/Registries';
import { Power } from '../../core/abilities/Ability';

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
		player.dimension.spawnParticle('r4isen1920_originspe:pinpoint_on_shoot', {
			x: player.location.x + viewDirection.x,
			y: player.location.y + 1 + viewDirection.y,
			z: player.location.z + viewDirection.z
		});

		hurtEntity.dimension.spawnParticle('r4isen1920_originspe:pinpoint_on_hit', {
			x: hurtEntity.location.x,
			y: hurtEntity.location.y + 1,
			z: hurtEntity.location.z
		});

		player.dimension.playSound('ender_eye.dead', hurtEntity.location);
		player.dimension.playSound('ender_eye.dead', player.location);
	}
}
