import { Player, EquipmentSlot } from '@minecraft/server';
import { RegisterPower } from '../Registries';
import { Power } from '../Ability';
import { PlayerState } from '../../core/PlayerState';
import { AttributeService } from '../../services/AttributeService';

/**
 * Need for Mobility is a passive power that makes the holder slower when wearing
 * heavy armor (netherite, diamond, iron). Loose: dispatched to whoever is
 * granted the power, with no origin coupling.
*/

@RegisterPower
export class Need_For_Mobility implements Power {
	readonly id = 'need_for_mobility';
	readonly tickInterval = 4;
	private static readonly HEAVY_ARMOR_PREFIXES = ['netherite_', 'diamond_', 'iron_'];

	onRelease(player: Player): void {
		const state = PlayerState.for(player);
		state.setFlag('is_heavy', false);
		AttributeService.apply(player, { movement: 0.1 });
	}

	onTick(player: Player): void {
		const state = PlayerState.for(player);

		const equippableComp = player.getComponent('equippable');
		if (!equippableComp) return;

		const head = equippableComp.getEquipment(EquipmentSlot.Head)?.typeId;
		const chest = equippableComp.getEquipment(EquipmentSlot.Chest)?.typeId;
		const legs = equippableComp.getEquipment(EquipmentSlot.Legs)?.typeId;
		const feet = equippableComp.getEquipment(EquipmentSlot.Feet)?.typeId;

		const currentArmor = [head, chest, legs, feet];

		const hasHeavyArmor = currentArmor.some(
			(armor) =>
				armor &&
				Need_For_Mobility.HEAVY_ARMOR_PREFIXES.some((prefix) => armor.includes(prefix))
		);

		const isClaustrophobic = state.getFlag<boolean>('is_claustrophobic_slow') === true;

		if (hasHeavyArmor) {
			state.setFlag('is_heavy', true);
			AttributeService.apply(player, { movement: 0.05 });
		} else {
			state.setFlag('is_heavy', false);
			if (!isClaustrophobic) {
				AttributeService.apply(player, { movement: 0.1 });
			}
		}
	}
}
