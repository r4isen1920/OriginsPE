import { ItemUseBeforeEvent, Player, world } from '@minecraft/server';
import { Power } from '../Ability';
import { RegisterPower } from '../Registries';
import { PlayerState } from '../../core/PlayerState';
import { Log } from '../../utils/Log';

/**
 * Carnivorous diet: vegetable-based food gives no nutrition. We block use-time
 * via item events and let the player consume meat normally.
 *
 * Minimal port: only the well-known plant foods are blocked. Extend as needed.
 */
@RegisterPower
export class Carnivore implements Power {
	readonly id = 'carnivore';

	private static readonly log = Log.get('Carnivore');

	private static readonly BLOCKED = new Set<string>([
		'minecraft:apple',
		'minecraft:bread',
		'minecraft:carrot',
		'minecraft:potato',
		'minecraft:baked_potato',
		'minecraft:beetroot',
		'minecraft:beetroot_soup',
		'minecraft:melon_slice',
		'minecraft:pumpkin_pie',
		'minecraft:cookie',
		'minecraft:sweet_berries',
		'minecraft:glow_berries',
		'minecraft:chorus_fruit',
		'minecraft:dried_kelp',
		'minecraft:golden_carrot',
		'minecraft:poisonous_potato',
		'minecraft:glistering_melon_slice',
		'minecraft:cooked_salmon',
		'minecraft:cooked_cod'
	]);

	constructor() {
		try {
			world.beforeEvents.itemUse.subscribe((ev: ItemUseBeforeEvent) => {
				const player = ev.source;
				if (!player || !player.isValid) return;

				const state = PlayerState.for(player);
				const origin = state.getOrigin();

				if (origin !== 'arachnid' && origin !== 'feline') {
					return;
				}

				if (Carnivore.BLOCKED.has(ev.itemStack.typeId)) {
					ev.cancel = true;
				}
			});
		} catch (error: any) {
			Carnivore.log.error(`Initialization structural crash: ${error?.stack ?? error}`);
		}
	}
}
