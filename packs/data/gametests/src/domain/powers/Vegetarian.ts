import { ItemUseAfterEvent, Player } from '@minecraft/server';
import { Power } from '../Ability';
import { RegisterPower } from '../Registries';

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
		'minecraft:cooked_rabbit',
	]);

	onItemUse(player: Player, ev: ItemUseAfterEvent): void {
		if (Vegetarian.BLOCKED.has(ev.itemStack.typeId)) {
			player.onScreenDisplay.setActionBar(
				'origins.hud.overhead_text:origins.vegetarian.blocked'
			);
			player.playSound('note.bass');
		}
	}
}
