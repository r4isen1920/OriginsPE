import { Player, EntityDamageCause } from '@minecraft/server';
import { Power } from '../Ability';
import { PlayerState } from '../../core/PlayerState';
import { RegisterPower } from '../Registries';
import { AttributeService } from '../../services/AttributeService';

@RegisterPower
export class Gills implements Power {
	readonly id = 'gills';
	readonly tickInterval = 3;

	onTick(player: Player): void {
		const state = PlayerState.for(player);

		const isInWater = player.isSwimming || player.isInWater;

		if (isInWater) {
			AttributeService.apply(player, { breathable: 'underwater' });
			state.setFlag('gills_active', true);
		} else {
			player.applyDamage(1, { cause: EntityDamageCause.drowning });
			state.setFlag('gills_active', false);
		}
	}
}
