import { Player, EquipmentSlot } from '@minecraft/server';
import { RegisterPower } from '../Registries';
import { Power } from '../Ability';
import { PlayerTick } from '../../core/Ticker';
import { PlayerState } from '../../core/PlayerState';
import { Log } from '../../utils/Log';

/**
 * Need for Mobility is a passive power that makes Elytrians slower when wearing heavy armor 
 * (netherite, diamond, iron) 
*/

@RegisterPower
export class Need_For_Mobility implements Power {
	readonly id = 'need_for_mobility';
	private static readonly log = Log.get('Need_For_Mobility');
	private static readonly HEAVY_ARMOR_PREFIXES = ['netherite_', 'diamond_', 'iron_'];

	@PlayerTick(4)
	static onPlayerTick(player: Player): void {
		try {
			const state = PlayerState.for(player);
			if (state.getOrigin() !== 'elytrian') return;

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
				player.triggerEvent('r4isen1920_originspe:movement.0.05');
			} else {
				state.setFlag('is_heavy', false);
				if (!isClaustrophobic) {
					player.triggerEvent('r4isen1920_originspe:movement.0.1');
				}
			}
		} catch (error: any) {
			Need_For_Mobility.log.error(
				`Error inside Need_For_Mobility tick handler: ${error?.stack ?? error}`
			);
		}
	}
}
