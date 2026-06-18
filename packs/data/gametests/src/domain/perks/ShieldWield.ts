import { EquipmentSlot, InputButton, ButtonState, Player, TicksPerSecond } from '@minecraft/server';
import { Perk } from '../Ability';
import { RegisterPerk } from '../Registries';

/**
 * You get additional protection when blocking yourself with a shield.
 */
@RegisterPerk
export class ShieldWield implements Perk {
	readonly id = 'less_shield_slowdown';
	readonly tickInterval = 2;

	onRelease(player: Player): void {
		player.removeEffect('resistance');
	}

	onTick(player: Player): void {
		const offhand = player.getComponent('equippable')?.getEquipment(EquipmentSlot.Offhand);
		const hasShield = offhand?.typeId === 'minecraft:shield';

		const isSneaking =
			player.inputInfo.getButtonState(InputButton.Sneak) === ButtonState.Pressed;

		if (hasShield && isSneaking) {
			player.addEffect('resistance', TicksPerSecond * 3, {
				amplifier: 0,
				showParticles: false
			});
		} else {
			player.removeEffect('resistance');
		}
	}
}
