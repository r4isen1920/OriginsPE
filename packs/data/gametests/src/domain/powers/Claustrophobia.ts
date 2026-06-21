import { Player } from '@minecraft/server';
import { RegisterPower } from '../../core/abilities/Registries';
import { Power } from '../../core/abilities/Ability';
import { PlayerState } from '../../core/platform/PlayerState';
import { AttributeService } from '../../services/AttributeService';

/**
 * Claustrophobia is a slow debuff that builds up while in tight spaces. Loose:
 * dispatched to whoever is granted the power, with no origin coupling.
 */

@RegisterPower
export class Claustrophobia implements Power {
	readonly id = 'claustrophobia';
	readonly tickInterval = 2;

	onRelease(player: Player): void {
		const state = PlayerState.for(player);
		state.setFlag('claustrophobia_level', undefined);
		state.setFlag('is_claustrophobic_slow', false);
		AttributeService.apply(player, { attack: 1 });
		if (state.getFlag<boolean>('is_heavy') !== true) {
			AttributeService.apply(player, { movement: 0.1 });
		}
	}

	onTick(player: Player): void {
		const state = PlayerState.for(player);

		const headLocation = player.getHeadLocation();
		const ceilingBlock = player.dimension.getBlockAbove({
			x: headLocation.x,
			y: headLocation.y,
			z: headLocation.z
		});

		let claustrophobiaLevel = state.getFlag<number>('claustrophobia_level') ?? 0;

		if (!ceilingBlock || !ceilingBlock.isValid || ceilingBlock.isAir) {
			claustrophobiaLevel = Math.max(claustrophobiaLevel - 2, 0);
		} else {
			claustrophobiaLevel = Math.min(claustrophobiaLevel + 2, 200);
		}

		state.setFlag('claustrophobia_level', claustrophobiaLevel);

		if (claustrophobiaLevel < 150) {
			state.setFlag('is_claustrophobic_slow', false);
			AttributeService.apply(player, { attack: 1 });

			if (state.getFlag<boolean>('is_heavy') !== true) {
				AttributeService.apply(player, { movement: 0.1 });
			}
		} else {
			state.setFlag('is_claustrophobic_slow', true);
			AttributeService.apply(player, { attack: 0 });
			AttributeService.apply(player, { movement: 0.05 });
		}
	}
}
