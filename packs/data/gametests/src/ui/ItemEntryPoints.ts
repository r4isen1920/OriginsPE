import { ItemStartUseAfterEvent, Player } from '@minecraft/server';

import { Items } from '../Files';
import { AfterItemStartUse } from '../core/platform/DecoratedEvents';
import { Log } from '../utils/Log';
import { PlayerState } from '../core/platform/PlayerState';
import { EntityUtils } from '../utils/EntityUtils';
import { UiBridge } from './UiBridge';
import { PickerKind, PickerMode } from './UiPayload';
import { isToggleOn } from './OptionsState';


//#region TYPES

interface ItemUseGate {
	/** Returns an action-bar message if the use should be blocked, else `undefined`. */
	(player: Player): string | undefined;
}

interface ItemHandler {
	id: string;
	gate?: ItemUseGate;
	onStartUse(player: Player): void;
}


//#region GATES

const requireOnGround: ItemUseGate = (player) =>
	player.isOnGround ? undefined : 'You must be on the ground to use this item!';


//#region BUILT-IN HANDLERS

const ORB_OF_ORIGINS: ItemHandler = {
	id: Items.OrbOfOrigins,
	gate: requireOnGround,
	onStartUse(player) {
		if (!isToggleOn('orb')) {
			player.onScreenDisplay.setActionBar('origins.hud.overhead_text:origins.change.fail.race');
			return;
		}
		PlayerState.for(player).setFlag('change_resign', true);
		UiBridge.openPicker(player, PickerKind.Race, PickerMode.Change);
		player.playSound('ui.wood_click');
	},
};

const RESIGNATION_PAPER: ItemHandler = {
	id: Items.ResignationPaper,
	gate: requireOnGround,
	onStartUse(player) {
		if (!isToggleOn('paper')) {
			player.onScreenDisplay.setActionBar('origins.hud.overhead_text:origins.change.fail.class');
			return;
		}
		PlayerState.for(player).setFlag('change_resign', true);
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
		if (!EntityUtils.isPlayer(ev.source)) return;
		const handler = HANDLERS.get(ev.itemStack.typeId);
		if (!handler) return;
		const reason = handler.gate?.(ev.source);
		if (reason) {
			ev.source.onScreenDisplay.setActionBar(reason);
			ev.source.playSound('note.bass');
			return;
		}
		try { handler.onStartUse(ev.source); }
		catch (e: any) { this.log.error(`startUse '${handler.id}': `, e); }
	}
}
