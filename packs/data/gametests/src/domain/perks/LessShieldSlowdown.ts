import { EquipmentSlot, InputButton, ButtonState, Player, TicksPerSecond, EntityComponentTypes, EntityDamageCause } from '@minecraft/server';
import { Perk } from '../../core/abilities/Ability';
import { RegisterPerk } from '../../core/abilities/Registries';
import { EntityUtils } from '../../utils/EntityUtils';
import { MinecraftItemTypes } from '@minecraft/vanilla-data';
import { AttributeSourceInstance } from '../../services';



@RegisterPerk
export class LessShieldSlowdown implements Perk {
	readonly id = 'less_shield_slowdown';
	readonly tickInterval = 2;

	onTick(player: Player, attributes: AttributeSourceInstance): void {
		const equippable = EntityUtils.getComponent(player, EntityComponentTypes.Equippable);
		if (!equippable) return;

		const mainHand = equippable.getEquipment(EquipmentSlot.Mainhand);
		const offhand = equippable.getEquipment(EquipmentSlot.Offhand);
		const hasShield =
			mainHand?.typeId === MinecraftItemTypes.Shield ||
			offhand?.typeId === MinecraftItemTypes.Shield;

		const isSneaking =
			player.inputInfo.getButtonState(InputButton.Sneak) === ButtonState.Pressed;

		if (hasShield && isSneaking) {

			attributes.set({
				damageOverrides: [
					{
						cause: EntityDamageCause.entityAttack,
						multiplier: 0.9
					},
					{
						cause: EntityDamageCause.projectile,
						multiplier: 0.9
					}
				]
			})
		} else {
			attributes.clear();
		}
	}
}
