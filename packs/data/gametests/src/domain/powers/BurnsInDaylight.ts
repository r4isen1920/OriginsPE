import { Player, EquipmentSlot, GameMode } from '@minecraft/server';
import { Power } from '../../core/abilities/Ability';
import { RegisterPower } from '../../core/abilities/Registries';
import { PlayerState } from '../../core/platform/PlayerState';
import { AttributeService, AttributeSourceInstance } from '../../services/AttributeService';
import { EntityUtils } from '../../utils/EntityUtils';

@RegisterPower
export class BurnsInDaylight implements Power {
	readonly id = 'burns_in_daylight';
	readonly tickInterval = 5;

	onTick(player: Player, attributes: AttributeSourceInstance): void {
		if (player.getGameMode() === GameMode.Creative) return;

		const state = PlayerState.for(player);
		const isPhantom = state.getFlag<boolean>('is_phantomized') ?? false;

		const equippableComp = EntityUtils.getComponent(player, 'equippable');
		const hasHelmet = !!equippableComp?.getEquipment(EquipmentSlot.Head);

		attributes.set({
			burnsInDaylight: !isPhantom && !hasHelmet,
		});
	}
}
