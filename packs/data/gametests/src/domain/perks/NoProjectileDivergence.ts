
import { ProjectileHitBlockAfterEvent, ProjectileHitEntityAfterEvent, system } from '@minecraft/server';
import { AfterProjectileHitBlock, AfterProjectileHitEntity } from '../../core';
import { Perk } from '../../core/abilities/Ability';
import { RegisterPerk } from '../../core/abilities/Registries';
import { Particles } from '../../Files';



@RegisterPerk
export class NoProjectileDivergence implements Perk {
    readonly id = 'no_projectile_divergence';

	// handled from the `packs/BP/entities/vanilla/arrow.se.templ` already

	@AfterProjectileHitBlock
	static onProjectileHitBlock(event: ProjectileHitBlockAfterEvent): void {
		const { projectile, dimension } = event;
		if (
			!projectile.isValid ||
			!projectile.hasTag('r4isen1920_originspe:perk_no_projectile_divergence')
		) return;

		dimension.spawnParticle(Particles.AccuracyOnHit, projectile.location);
		dimension.playSound('firework.twinkle', projectile.location, { volume: 0.1, pitch: 1.25 });
	}

	@AfterProjectileHitEntity
	static onProjectileHit(event: ProjectileHitEntityAfterEvent): void {
		const { source, dimension } = event;
		const victim = event.getEntityHit()?.entity;
		if (
			!source || !source.isValid ||
			!source.hasTag('r4isen1920_originspe:perk_no_projectile_divergence') ||
			!victim || !victim.isValid
		) return;

		const aabb = victim.getAABB();
		dimension.spawnParticle(Particles.AccuracyOnHit, aabb.center);
		dimension.playSound('firework.twinkle', aabb.center, { volume: 0.1, pitch: 1.25 });
	}
}
