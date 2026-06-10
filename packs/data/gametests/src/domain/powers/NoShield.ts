import { Player, EquipmentSlot } from '@minecraft/server';
import { Power } from '../Ability';
import { PlayerState } from '../../core/PlayerState';
import { RegisterPower } from '../Registries';

@RegisterPower
export class NoShield implements Power {
	readonly id = 'no_shield';
	readonly tickInterval = 1;

	onTick(player: Player): void {
		if (!player?.isValid || !player.isSneaking) return;

		const state = PlayerState.for(player);
		if (!state || !state.hasPower('no_shield')) return;

		const equippableComp = player.getComponent('equippable');
		if (!equippableComp) return;

		const offhandItem = equippableComp.getEquipment(EquipmentSlot.Offhand);
		if (offhandItem?.typeId === 'minecraft:shield') {
			equippableComp.setEquipment(EquipmentSlot.Offhand, undefined);
			this.breakShieldEffects(player);
			return;
		}

		const mainhandItem = equippableComp.getEquipment(EquipmentSlot.Mainhand);
		if (mainhandItem?.typeId === 'minecraft:shield') {
			equippableComp.setEquipment(EquipmentSlot.Mainhand, undefined);
			this.breakShieldEffects(player);
		}
	}

	private breakShieldEffects(player: Player): void {
		player.playSound('random.break', { volume: 1.0, pitch: 1.0 });

		player.dimension.spawnParticle('r4isen1920_originspe:shield_break', {
			x: player.location.x,
			y: player.location.y + 0.5,
			z: player.location.z
		});
	}
}
