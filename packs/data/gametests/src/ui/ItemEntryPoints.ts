import { GameMode, ItemStartUseAfterEvent, Player } from '@minecraft/server';

import { Items } from '../Files';
import { AfterItemStartUse } from '../core/platform/DecoratedEvents';
import { Log } from '../utils/Log';
import { PlayerState } from '../core/platform/PlayerState';
import { EntityUtils } from '../utils/EntityUtils';
import { UiBridge } from './UiBridge';
import { PickerKind, PickerMode } from './UiPayload';
import { isToggleOn } from './OptionsState';
import OverheadText from './OverheadText';
import ChangeProtectionService from '../services/ChangeProtectionService';


//#region TYPES

interface ItemHandler {
	id: string;
	onStartUse(player: Player): void;
}


//#region GUARD

/**
 * Reports whether `player` is currently allowed to open a change picker,
 * showing the matching overhead message when they are not.
 */
function canStartChange(player: Player): boolean {
	if (!player.isOnGround) {
		OverheadText.show(player, 'origins.change.fail.not_on_ground');
		return false;
	}
	const blocked = ChangeProtectionService.blockReason(player);
	if (blocked) {
		OverheadText.show(player, `origins.change.fail.${blocked}`);
		return false;
	}
	return true;
}


//#region BUILT-IN HANDLERS

const ORB_OF_ORIGINS: ItemHandler = {
	id: Items.OrbOfOrigins,
	onStartUse(player) {
		if (!isToggleOn('orb')) {
			OverheadText.show(player, 'origins.change.fail.race');
			return;
		}
		if (!canStartChange(player)) return;
		PlayerState.for(player).setFlag('change_resign', true);
		ChangeProtectionService.protect(player);
		UiBridge.openPicker(player, PickerKind.Race, PickerMode.Change);
		player.playSound('ui.wood_click');
	},
};

const RESIGNATION_PAPER: ItemHandler = {
	id: Items.ResignationPaper,
	onStartUse(player) {
		if (!isToggleOn('paper')) {
			OverheadText.show(player, 'origins.change.fail.class');
			return;
		}
		if (!canStartChange(player)) return;
		PlayerState.for(player).setFlag('change_resign', true);
		ChangeProtectionService.protect(player);
		UiBridge.openPicker(player, PickerKind.Class, PickerMode.Change);
		player.playSound('ui.wood_click');
	},
};

const HANDLERS = new Map<string, ItemHandler>([
	[ORB_OF_ORIGINS.id, ORB_OF_ORIGINS],
	[RESIGNATION_PAPER.id, RESIGNATION_PAPER],
]);


//#region ENTRY POINTS

/**
 * Routes special-item starts (Orb of Origins, Resignation Paper)
 * to the picker UI.
 */
export class ItemEntryPoints {
	private static readonly log = Log.get('ItemEntryPoints', 'ui');

	@AfterItemStartUse()
	static onStartUse(ev: ItemStartUseAfterEvent): void {
		const player = ev.source;
		if (!(player instanceof Player)) return;

		const handler = HANDLERS.get(ev.itemStack.typeId);
		if (!handler) return;

		try { handler.onStartUse(player); }
		catch (e: any) { this.log.error(`startUse '${handler.id}': `, e); }
	}
}


//#region DECREMENT STK
/**
 * Removes one item from the player's stack of the given item, if they have any.
 * 
 * @remarks
 * This uses the `clear` command.
 * Although native container APIs could be used, this is simpler and more straightforward.
 * 
 * @param player The player to remove the item from.
 * @param itemId The type identifier of the item to remove.
 */
export function decrementStack(player: Player, itemId: string): void {
	const gm = player.getGameMode();
	if (gm === GameMode.Creative) return;

	player.runCommand(`clear @s ${itemId} 0 1`);
}