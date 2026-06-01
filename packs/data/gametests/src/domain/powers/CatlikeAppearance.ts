import { EntityHitEntityAfterEvent, Player, system } from '@minecraft/server';
import { RegisterPower } from '../Registries';
import { Power } from '../Ability';
import { PlayerState } from '../../core/PlayerState';
import { AttributeService } from '../../services/AttributeService';

@RegisterPower
export class CatlikeAppearance implements Power {
	readonly id = 'catlike_appearance';
	readonly tickInterval = 3;

	onRelease(player: Player): void {
		AttributeService.apply(player, { familyType: 'player' });
	}

	onAttack(player: Player, ev: EntityHitEntityAfterEvent): void {
		if (ev.hitEntity.typeId !== 'minecraft:creeper') return;
		const state = PlayerState.for(player);
		state.setFlag(`creeper_retaliation_${ev.hitEntity.id}`, system.currentTick + 200);
	}

	onTick(player: Player): void {
		const state = PlayerState.for(player);

		AttributeService.apply(player, { familyType: 'cat' });

		const currentTick = system.currentTick;
		const nearbyCreepers = player.dimension.getEntities({
			location: player.location,
			maxDistance: 16,
			type: 'minecraft:creeper'
		});

		for (const creeper of nearbyCreepers) {
			try {
				const retaliationExpiry =
					state.getFlag<number>(`creeper_retaliation_${creeper.id}`) ?? 0;
				if (currentTick < retaliationExpiry) continue;

				creeper.triggerEvent('minecraft:stop_exploding');

				const targetComp = creeper.getComponent('target');
				if (targetComp && (targetComp as any).target?.id === player.id) {
					(targetComp as any).clearTarget();
				}

				const dx = creeper.location.x - player.location.x;
				const dz = creeper.location.z - player.location.z;
				const distance = Math.sqrt(dx * dx + dz * dz);

				if (distance < 10 && distance > 0.1) {
					creeper.applyImpulse({
						x: (dx / distance) * 0.4,
						y: 0.1,
						z: (dz / distance) * 0.4
					});
				}
			} catch {}
		}
	}
}
