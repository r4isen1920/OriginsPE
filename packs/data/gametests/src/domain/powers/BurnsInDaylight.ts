import { Player, EquipmentSlot } from '@minecraft/server';
import { Power } from '../../core/abilities/Ability';
import { RegisterPower } from '../../core/abilities/Registries';
import { PlayerState } from '../../core/platform/PlayerState';
import { AttributeService } from '../../services/AttributeService';

@RegisterPower
export class BurnsInDaylight implements Power {
	readonly id = 'burns_in_daylight';
	readonly tickInterval = 5;

	onTick(player: Player): void {
		if (!player?.isValid) return;

		const state = PlayerState.for(player);
		if (!state || !state.hasPower('burns_in_daylight')) return;

		const isPhantom = state.getFlag<boolean>('is_phantomized') ?? false;
		const equippableComp = player.getComponent('equippable');
		const hasHelmet = !!equippableComp?.getEquipment(EquipmentSlot.Head);

		if (isPhantom || hasHelmet) {
			AttributeService.apply(player, { burnsInDaylight: false });
		} else {
			AttributeService.apply(player, { burnsInDaylight: true });
		}
	}
}
