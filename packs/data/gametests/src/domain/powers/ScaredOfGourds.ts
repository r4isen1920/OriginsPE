import { Player, TicksPerSecond } from '@minecraft/server';
import { RegisterPower } from '../Registries';
import { Power } from '../Ability';
import { AttributeService } from '../../services/AttributeService';

@RegisterPower
export class ScaredOfGourds implements Power {
	readonly id = 'pumpkin_hate';
	readonly tickInterval = 3;

	onRelease(player: Player): void {
		AttributeService.apply(player, { isShaking: false });
	}

	onTick(player: Player): void {
		const inventoryComp = player.getComponent('inventory');
		if (!inventoryComp?.container) return;

		let hasPumpkin = false;

		for (let i = 0; i < inventoryComp.container.size; i++) {
			const item = inventoryComp.container.getItem(i);
			if (item && item.typeId.includes('pumpkin')) {
				hasPumpkin = true;
				break;
			}
		}

		if (hasPumpkin) {
			AttributeService.apply(player, { isShaking: true });
			player.addEffect('weakness', TicksPerSecond * 12, { amplifier: 1 });
		} else {
			AttributeService.apply(player, { isShaking: false });
		}
	}
}
