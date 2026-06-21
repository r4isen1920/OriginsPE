import { Player, EntityEquippableComponent, EquipmentSlot } from '@minecraft/server';
import { Power } from '../../core/abilities/Ability';
import { RegisterPower } from '../../core/abilities/Registries';
import { PlayerState } from '../../core/platform/PlayerState';

@RegisterPower
export class NoWeapon implements Power {
	readonly id = 'no_weapon';
	readonly tickInterval = 3;

	onTick(player: Player): void {
		if (!player?.isValid) return;

		const state = PlayerState.for(player);
		if (!state) {
			return;
		}

		if (!state.hasPower('no_weapon')) {
			player.removeEffect('minecraft:weakness');
			return;
		}

		const equippable = player.getComponent('minecraft:equippable') as EntityEquippableComponent;
		if (!equippable) {
			return;
		}

		const item = equippable.getEquipment(EquipmentSlot.Mainhand);
		if (item) {
			player.addEffect('minecraft:weakness', 10, { amplifier: 2, showParticles: false });
		} else {
			player.removeEffect('minecraft:weakness');
		}
	}
}
