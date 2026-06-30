import { Player, EquipmentSlot } from '@minecraft/server';
import { Power } from '../../core/abilities/Ability';
import { RegisterPower } from '../../core/abilities/Registries';
import { PlayerState } from '../../core/platform/PlayerState';
import { AttributeService } from '../../services/AttributeService';

@RegisterPower
export class VampireThing implements Power {
	readonly id = 'vampire_thing';
	readonly tickInterval = 5;

	onTick(player: Player): void {
		if (!player?.isValid) return;

		const state = PlayerState.for(player);
		if (!state || !state.hasPower('vampire_thing')) return;

		AttributeService.apply(player, { burnsInDaylight: true });
	}
}
