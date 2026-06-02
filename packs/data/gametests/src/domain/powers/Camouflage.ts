import { EntityHitEntityAfterEvent, Player, system } from '@minecraft/server';
import { RegisterPower } from '../Registries';
import { Power } from '../Ability';
import { PlayerState } from '../../core/PlayerState';
import { AttributeService } from '../../services/AttributeService';

type TargetComponent = {
	target?: { id: string };
	clearTarget(): void;
};

@RegisterPower
export class Camouflage implements Power {
	readonly id = 'camouflage';
	readonly tickInterval = 3;

	onRelease(player: Player): void {
		AttributeService.apply(player, { familyType: 'player' });
	}

	onAttack(player: Player, ev: EntityHitEntityAfterEvent): void {
		const state = PlayerState.for(player);
		state.setFlag(`camo_retaliation_${ev.hitEntity.id}`, system.currentTick + 200);
	}

	onTick(player: Player): void {
		const state = PlayerState.for(player);

		if (player.isSneaking) {
			AttributeService.apply(player, { familyType: 'camouflage' });

			const currentTick = system.currentTick;
			const nearbyHostiles = player.dimension.getEntities({
				location: player.location,
				maxDistance: 16,
				excludeFamilies: ['player', 'inanimate']
			});

			for (const entity of nearbyHostiles) {
				try {
					// const targetComp = entity.getComponent('target') as TargetComponent | undefined;
					// if (!targetComp) continue;

					// const currentTarget = targetComp.target;
					// if (!currentTarget || currentTarget.id !== player.id) continue;

					// const retaliationExpiry =
					// 	state.getFlag<number>(`camo_retaliation_${entity.id}`) ?? 0;
					// if (currentTick < retaliationExpiry) continue;

					// entity.clearVelocity();
					// targetComp.clearTarget();
				} catch {}
			}
		} else {
			AttributeService.apply(player, { familyType: 'player' });
		}
	}
}
