import { ItemStartUseAfterEvent, Player } from '@minecraft/server';

import { Items } from '../Files';
import { AfterItemStartUse } from '../core/platform/DecoratedEvents';
import { Log } from '../utils/Log';
import { PlayerState } from '../core/platform/PlayerState';
import { EntityUtils } from '../utils/EntityUtils';
import { UiBridge } from './UiBridge';
import { PickerKind, PickerMode } from './UiPayload';
import { isToggleOn } from './OptionsState';
import OverheadText from './OverheadText';


//#region TYPES

interface ItemHandler {
	id: string;
	onStartUse(player: Player): void;
}


//#region BUILT-IN HANDLERS

const ORB_OF_ORIGINS: ItemHandler = {
	id: Items.OrbOfOrigins,
	onStartUse(player) {
		if (!isToggleOn('orb')) {
			OverheadText.show(player, 'origins.change.fail.race');
			return;
		}
		if (!player.isOnGround) {
			OverheadText.show(player, 'origins.change.fail.not_on_ground');
			return;
		}
		PlayerState.for(player).setFlag('change_resign', true);
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
		if (!player.isOnGround) {
			OverheadText.show(player, 'origins.change.fail.not_on_ground');
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
		try { handler.onStartUse(ev.source); }
		catch (e: any) { this.log.error(`startUse '${handler.id}': `, e); }
	}
}
