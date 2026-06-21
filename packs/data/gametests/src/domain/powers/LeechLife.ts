import { EntityDamageCause, EntityHurtAfterEvent, Player, world } from '@minecraft/server';
import { Power } from '../../core/abilities/Ability';
import { RegisterPower } from '../../core/abilities/Registries';
import { PlayerState } from '../../core/platform/PlayerState';
import { AfterEntityHurt } from '../../core/platform/DecoratedEvents';

const SPREADING_TAG = 'chain_damage_spreading';

@RegisterPower
export class LeechLife implements Power {
	readonly id = 'leech_life';

	@AfterEntityHurt()
	static onDamageSpread(ev: EntityHurtAfterEvent): void {
		const { hurtEntity, damage } = ev;
		if (!hurtEntity?.isValid) return;

		if (hurtEntity.hasTag(SPREADING_TAG)) return;

		const tag = hurtEntity.getTags().find((t) => t.startsWith('is_in_active_chain_'));
		if (!tag) return;

		const ownerId = tag.replace('is_in_active_chain_', '');
		if (!ownerId) return;

		const player = world.getEntity(ownerId) as Player | undefined;
		if (!player?.isValid) return;

		const state = PlayerState.for(player);
		if (!state || !state.hasPower('leech_life')) return;

		const chained = hurtEntity.dimension.getEntities({ tags: [tag] });
		const spread = Math.floor(damage * 0.25);
		if (spread <= 0) return;

		for (const entity of chained) {
			if (!entity?.isValid || entity.id === hurtEntity.id) continue;

			entity.addTag(SPREADING_TAG);
			entity.applyDamage(spread, { cause: EntityDamageCause.magic });
			entity.removeTag(SPREADING_TAG);

			entity.dimension.spawnParticle(
				'r4isen1920_originspe:rootkin_vine_dmg_spread',
				entity.location
			);
		}
	}
}
