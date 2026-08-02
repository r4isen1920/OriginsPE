
import { ProjectileHitBlockAfterEvent, ProjectileHitEntityAfterEvent } from '@minecraft/server';
import { AfterProjectileHitBlock, AfterProjectileHitEntity } from '../../core';
import { Perk } from '../../core/abilities/Ability';
import { RegisterPerk } from '../../core/abilities/Registries';
import { Particles } from '../../Files';



@RegisterPerk
export class NoProjectileDivergence implements Perk {
    readonly id = 'no_projectile_divergence';

	// handled from the `packs/BP/entities/vanilla/arrow.se.templ` already

	@AfterProjectileHitBlock
	@AfterProjectileHitEntity
	static onProjectileHit(event: ProjectileHitBlockAfterEvent | ProjectileHitEntityAfterEvent): void {
		const { projectile, dimension } = event;
		if (
			!projectile.isValid ||
			!projectile.hasTag('_no_projectile_divergence')
		) return;

		dimension.spawnParticle(Particles.AccuracyOnHit, projectile.location);
		dimension.playSound('firework.twinkle', projectile.location, { volume: 0.1, pitch: 1.25 });
	}
}
