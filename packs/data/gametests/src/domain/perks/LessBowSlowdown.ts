import { EntityComponentTypes, EquipmentSlot, Player } from '@minecraft/server';

import { Perk } from '../../core/abilities/Ability';
import { RegisterPerk } from '../../core/abilities/Registries';
import { EntityUtils } from '../../utils';
import { MinecraftItemTypes } from '@minecraft/vanilla-data';
import { AttributeSourceInstance } from '../../services';


@RegisterPerk
export class LessBowSlowdown implements Perk {
	readonly id = 'less_bow_slowdown';

	onTick(player: Player, attributes: AttributeSourceInstance): void {
		const equippable = EntityUtils.getComponent(player, EntityComponentTypes.Equippable);
		if (
			!equippable ||
			equippable.getEquipment(EquipmentSlot.Mainhand)?.typeId !== MinecraftItemTypes.Bow
		) {
			attributes.clear();
			return;
		}

		attributes.set({
			movement: { add: 0.025 }
		});
	}
}
