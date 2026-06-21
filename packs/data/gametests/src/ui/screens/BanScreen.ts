import { Player } from '@minecraft/server';

import { PickerMode } from '../UiPayload';
import { isValidId } from '../PickerRegistry';
import { toggleBan } from '../PickerNavigation';
import { isKind, resolveBanMode } from '../state/PickerModeSolver';
import { Screen } from './Screen';


//#region BAN SCREEN

/**
 * Handles the ban screen, which allows banning and unbanning Origins and Classes.
 */
export class BanScreen extends Screen {
	readonly verbs = ['ban', 'unban'] as const;

	handle(player: Player, parts: string[]): void {
		switch (parts[0]) {
			case 'ban': return this.handleBan(player, parts);
			case 'unban': return this.handleUnban(player, parts);
		}
	}


	//#region HANDLERS

	private handleBan(player: Player, [, kind, id]: string[]): void {
		if (!isKind(kind) || !id || !isValidId(kind, id)) return;
		const currentMode = resolveBanMode(kind, id);
		if (currentMode === PickerMode.BanLocked || currentMode === PickerMode.BanLimit) {
			// Safety guard: blocked states should be non-interactive in the UI,
			// but defend against any edge-case script path reaching here.
			this.openPickerScene(player, kind, currentMode, id);
			return;
		}
		toggleBan(kind, id);

		// After banning, the mode for this id is now 'banned'.
		this.openPickerScene(player, kind, PickerMode.Banned, id);
	}

	private handleUnban(player: Player, [, kind, id]: string[]): void {
		if (!isKind(kind) || !id || !isValidId(kind, id)) return;
		toggleBan(kind, id); // removes ban
		// Re-resolve mode now that the ban has been lifted.
		const mode = resolveBanMode(kind, id);
		this.openPickerScene(player, kind, mode, id);
	}
}
