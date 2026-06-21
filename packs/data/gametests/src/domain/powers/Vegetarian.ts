import { ItemUseBeforeEvent, Player } from '@minecraft/server';
import { Power } from '../Ability';
import { RegisterPower } from '../Registries';
import { PlayerState } from '../../core/PlayerState';

/**
 * vegetable diet: meat-based food gives no nutrition. We block use-time
 * via item events and let the player consume vegetable normally..
 */
@RegisterPower
export class Vegetarian implements Power {
	readonly id = 'vegetarian';
	private static readonly BLOCKED = new Set<string>([
		'minecraft:beef',
		'minecraft:chicken',
		'minecraft:mutton',
		'minecraft:porkchop',
		'minecraft:cod',
		'minecraft:salmon',
		'minecraft:rabbit',
		'minecraft:cooked_beef',
		'minecraft:cooked_chicken',
		'minecraft:cooked_mutton',
		'minecraft:cooked_porkchop',
		'minecraft:cooked_cod',
		'minecraft:cooked_salmon',
		'minecraft:cooked_rabbit'
	]);

	onBeforeItemUse(player: Player, ev: ItemUseBeforeEvent): void {
		if (!player || !player.isValid) return;

		const state = PlayerState.for(player);
		const origin = state.getOrigin();

		if (!state.hasPower('vegetarian')) return;

		if (Vegetarian.BLOCKED.has(ev.itemStack.typeId)) {
			ev.cancel = true;
		}
	}
}
