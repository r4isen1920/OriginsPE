import { EntityComponentTypes, Player, TicksPerSecond } from '@minecraft/server';
import { Perk } from '../../core/abilities/Ability';
import { RegisterPerk } from '../../core/abilities/Registries';
import { EntityUtils } from '../../utils/EntityUtils';
import { AttributeSourceInstance } from '../../services';



@RegisterPerk
export class LessHealthMoreAttack implements Perk {
	readonly id = 'less_health_more_attack';
	readonly tickInterval = 1;

	/** This amount of health lost (in percentage) equates to 1 attack increase */
	private readonly HP_LOST_PER_ATK_INCREASE = 0.25;

	onTick(player: Player, attribute: AttributeSourceInstance): void {
		const component = EntityUtils.getComponent(player, EntityComponentTypes.Health);
		if (!component) return;

		const percent = component.currentValue / component.effectiveMax;
		const atkIncrease = Math.floor((1 - percent) / this.HP_LOST_PER_ATK_INCREASE);
		if (atkIncrease <= 0) {
			attribute.clear();
			return;
		}

		attribute.set({
			attack: { add: atkIncrease }
		});
	}
}
