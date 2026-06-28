import { Player, system, ItemCompleteUseAfterEvent } from '@minecraft/server';
import { Power } from '../../core/abilities/Ability';
import { RegisterPower } from '../../core/abilities/Registries';
import { PlayerState } from '../../core/platform/PlayerState';
import { AttributeService } from '../../services/AttributeService';
import { ResourceBarService } from '../../services';
import { AfterItemCompleteUse } from '../../core/platform/DecoratedEvents';

const MEAT_WINDOW_TICKS = 400;
const MEAT_WINDOW_SECONDS = 20;

const LAST_FED_FLAG = 'i_want_meat:last_fed_tick';
const STARVING_FLAG = 'i_want_meat:is_starving';

const RESOURCE_BAR_ID = 12;

const MEAT_ITEMS = new Set([
	'minecraft:beef',
	'minecraft:cooked_beef',
	'minecraft:porkchop',
	'minecraft:cooked_porkchop',
	'minecraft:mutton',
	'minecraft:cooked_mutton',
	'minecraft:chicken',
	'minecraft:cooked_chicken',
	'minecraft:rabbit',
	'minecraft:cooked_rabbit',
	'minecraft:rotten_flesh',
	'minecraft:salmon',
	'minecraft:cooked_salmon',
	'minecraft:cod',
	'minecraft:cooked_cod'
]);


@RegisterPower
export class IWantMeat implements Power {
	readonly id = 'i_want_meat';
	readonly tickInterval = 20;

	onAcquire(player: Player): void {
		PlayerState.for(player).setFlag(LAST_FED_FLAG, system.currentTick);
		PlayerState.for(player).setFlag(STARVING_FLAG, false);
		ResourceBarService.push(player, {
			id: RESOURCE_BAR_ID,
			from: 100,
			to: 0,
			durationSeconds: MEAT_WINDOW_SECONDS
		});
	}

	onRelease(player: Player): void {
		const state = PlayerState.for(player);
		state.setFlag(LAST_FED_FLAG, undefined);
		state.setFlag(STARVING_FLAG, undefined);
		ResourceBarService.pop(player, RESOURCE_BAR_ID);
		AttributeService.reset(player);
		player.removeEffect('minecraft:weakness');
		player.removeEffect('minecraft:slowness');
	}

	onTick(player: Player): void {
		if (!player?.isValid) return;

		const state = PlayerState.for(player);
		if (!state.hasPower('i_want_meat')) return;

		const currentTick = system.currentTick;
		const lastFed = state.getFlag<number>(LAST_FED_FLAG) ?? currentTick;
		const isStarving = state.getFlag<boolean>(STARVING_FLAG) ?? false;
		const elapsed = currentTick - lastFed;

		if (!isStarving && elapsed >= MEAT_WINDOW_TICKS) {
			state.setFlag(STARVING_FLAG, true);

			player.addEffect('minecraft:weakness', 99999, { amplifier: 0, showParticles: false });
			player.addEffect('minecraft:slowness', 99999, { amplifier: 0, showParticles: false });

			ResourceBarService.push(player, {
				id: RESOURCE_BAR_ID,
				from: 0,
				to: 0,
				durationSeconds: 1,
				persist: true
			});
		}
	}

	@AfterItemCompleteUse
	static onItemCompleteUse(ev: ItemCompleteUseAfterEvent): void {
		const { itemStack, source: player } = ev;
		if (!(player instanceof Player)) return;
		if (!itemStack || !MEAT_ITEMS.has(itemStack.typeId)) return;

		const state = PlayerState.for(player);
		if (!state.hasPower('i_want_meat')) return;

		const currentTick = system.currentTick;
		state.setFlag(LAST_FED_FLAG, currentTick);

		if (state.getFlag<boolean>(STARVING_FLAG)) {
			state.setFlag(STARVING_FLAG, false);
			AttributeService.reset(player);

			player.removeEffect('minecraft:weakness');
			player.removeEffect('minecraft:slowness');

		}

		ResourceBarService.push(player, {
			id: RESOURCE_BAR_ID,
			from: 100,
			to: 0,
			durationSeconds: MEAT_WINDOW_SECONDS
		});
	}
}
