import {
	ItemCompleteUseAfterEvent,
	ItemStartUseAfterEvent,
	ItemUseAfterEvent,
	Player,
} from '@minecraft/server';

import { Items } from '../Files';
import {
	AfterItemCompleteUse,
	AfterItemStartUse,
	AfterItemUse,
} from '../core/DecoratedEvents';
import { Log } from '../utils/Log';
import { PlayerState } from '../core/PlayerState';
import { UiBridge } from '../core/UiBridge';
import { InventoryService } from '../services/InventoryService';
import { isToggleOn } from '../ui/OptionsState';
import { EntityUtils } from '../utils/EntityUtils';
import { PerkRegistry, PowerRegistry } from './Registries';


//#region HANDLERS

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
		UiBridge.openPicker(player, 'race', 'change');
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
		UiBridge.openPicker(player, 'class', 'change');
		player.playSound('ui.wood_click');
	},
};

const ORIGINS_MENU: ItemHandler = {
	id: Items.OriginsMenu,
	onStartUse(player) {
		if (InventoryService.isOpen(player)) InventoryService.close(player);
		else InventoryService.open(player);
		player.playSound('ui.wood_click');
	},
};

const ORIGINS_SUBMENU: ItemHandler = {
	id: Items.OriginsSubmenu,
	onStartUse(player) {
		InventoryService.close(player);
		const tag = isToggleOn('particle')
			? 'gui_options_general_root_particleon'
			: 'gui_options_general_root_particleoff';
		UiBridge.openDialogue(player, tag);
		player.playSound('ui.wood_click');
		player.playSound('random.orb', { volume: 1, pitch: 0.5 });
	},
};

const HANDLERS = new Map<string, ItemHandler>([
	[ORB_OF_ORIGINS.id, ORB_OF_ORIGINS],
	[RESIGNATION_PAPER.id, RESIGNATION_PAPER],
	[ORIGINS_MENU.id, ORIGINS_MENU],
	[ORIGINS_SUBMENU.id, ORIGINS_SUBMENU],
]);


//#region DISPATCHER

/**
 * Routes item events to the registered {@link ItemHandler} or, for any other
 * item, to active power/perk lifecycle hooks. Replaces the legacy item.ts
 * switch + ad-hoc subscriptions.
 */
export class ItemEvents {
	private static readonly log = Log.get('ItemEvents');

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
		catch (e: any) { this.log.error(`startUse '${handler.id}': ${e?.stack ?? e}`); }
	}

	@AfterItemUse()
	static onUse(ev: ItemUseAfterEvent): void {
		if (!EntityUtils.isPlayer(ev.source)) return;
		const player = ev.source as Player;
		const state = PlayerState.for(player);
		for (const id of state.getPowers()) {
			PowerRegistry.get(id)?.onItemUse?.(player, ev);
		}
		for (const id of state.getPerks()) {
			PerkRegistry.get(id)?.onItemUse?.(player, ev);
		}
	}

	@AfterItemCompleteUse()
	static onCompleteUse(ev: ItemCompleteUseAfterEvent): void {
		if (!EntityUtils.isPlayer(ev.source)) return;
		const player = ev.source as Player;
		const state = PlayerState.for(player);
		for (const id of state.getPowers()) {
			PowerRegistry.get(id)?.onItemCompleteUse?.(player, ev);
		}
		for (const id of state.getPerks()) {
			PerkRegistry.get(id)?.onItemCompleteUse?.(player, ev);
		}
	}
}
