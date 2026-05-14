import { ItemCompleteUseAfterEvent, Player } from '@minecraft/server';

import { Perk } from '../Ability';
import { RegisterPerk } from '../Registries';


/**
 * Reduces stew/soup hunger restoration debuff: applies a regeneration boost
 * shortly after consumption.
 */
@RegisterPerk
export class BetterStew implements Perk {
	readonly id = 'better_stew';

	private static readonly STEWS = new Set<string>([
		'minecraft:mushroom_stew',
		'minecraft:beetroot_soup',
		'minecraft:rabbit_stew',
		'minecraft:suspicious_stew',
	]);

	onItemCompleteUse(player: Player, ev: ItemCompleteUseAfterEvent): void {
		if (!BetterStew.STEWS.has(ev.itemStack.typeId)) return;
		player.addEffect('regeneration', 60, { amplifier: 1, showParticles: false });
		console.warn("nag regen ka ULOL")
	}
}
