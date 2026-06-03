import { Player, system, EntityHurtAfterEvent } from '@minecraft/server';
import { RegisterPower } from '../Registries';
import { Power } from '../Ability';
import { PlayerState } from '../../core/PlayerState';
import { AttributeService } from '../../services/AttributeService';
import { AfterEntityHurt } from '../../core/DecoratedEvents';

@RegisterPower
export class FamiliarFace implements Power {
	readonly id = 'familiar_face';
	readonly tickInterval = 3;

	@AfterEntityHurt
	static onEntityHurt(event: EntityHurtAfterEvent): void {
		const { damageSource, hurtEntity } = event;
		if (!damageSource.damagingEntity || !(damageSource.damagingEntity instanceof Player))
			return;

		const player = damageSource.damagingEntity;
		const state = PlayerState.for(player);
		if (state.getOrigin() !== 'enderian') return;

		const targetUid = hurtEntity.id;
		state.setFlag(`combat_retaliation_${targetUid}`, system.currentTick + 200);
	}

	onTick(player: Player): void {
		if (!player.isValid) return;

		const state = PlayerState.for(player);

		if (state.getOrigin() !== 'enderian') {
			AttributeService.apply(player, { familyType: 'player' });
			return;
		}

		AttributeService.apply(player, { familyType: 'enderman' });

		const currentTick = system.currentTick;
		const nearbyHostiles = player.dimension.getEntities({
			location: player.location,
			maxDistance: 16,
			excludeFamilies: ['player', 'inanimate']
		});

		for (const entity of nearbyHostiles) {
			const targetComp = entity.getComponent('target') as any;
			if (!targetComp) continue;
			const currentTarget = targetComp.target;
			if (!currentTarget || currentTarget.id !== player.id) continue;
			const retaliationExpiry = state.getFlag<number>(`combat_retaliation_${entity.id}`) ?? 0;
			if (currentTick < retaliationExpiry) continue;
			entity.clearVelocity();
			targetComp.clearTarget();
		}
	}
}
