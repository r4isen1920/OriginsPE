import { CommandPermissionLevel, Player, world } from '@minecraft/server';

import { WORLD_DYNAMIC_PROPERTIES } from '../../Constants';
import { PlayerState } from '../../core/platform/PlayerState';
import { PlayerLifecycle } from '../../core/abilities/PlayerLifecycle';
import { Log } from '../../utils/Log';
import { UiBridge } from '../UiBridge';
import { PickerKind } from '../UiPayload';
import { defaultId } from '../PickerRegistry';
import { resolvePickMode } from '../state/PickerModeSolver';
import { adminToggleVector, flipToggle, isToggleOn, resetAllToggles } from '../OptionsState';
import type { ToggleKey } from '../OptionsState';
import { Screen } from './Screen';


//#region OPTIONS SCREEN

/**
 * Handles the options screen, which includes general player options and admin controls.
 */
export class OptionsScreen extends Screen {
	private static readonly log = Log.get('OptionsScreen', 'ui');

	readonly verbs = ['open_options', 'toggle', 'reset', 'evict_unselected', 'close'] as const;

	handle(player: Player, parts: string[]): void {
		switch (parts[0]) {
			case 'open_options': return this.handleOpenOptions(player, parts);
			case 'toggle': return this.handleToggle(player, parts);
			case 'reset': return this.handleReset(player, parts);
			case 'evict_unselected': return this.handleEvictUnselected(player);
			case 'close': return UiBridge.closeScreen(player);
		}
	}


	//#region HELPERS

	private isAdmin(player: Player): boolean {
		return player.commandPermissionLevel !== CommandPermissionLevel.Any;
	}

	private isToggleKey(v: string | undefined): v is ToggleKey {
		return v === 'orb' || v === 'paper' || v === 'unique' || v === 'announce' || v === 'particle';
	}


	//#region HANDLERS

	private handleOpenOptions(player: Player, [, which]: string[]): void {
		// The Options menu does not use the picker HUD layer. Dismiss any lingering
		// picker title so its window stops rendering over the dialogue -- e.g. when
		// returning to the ban menu from a ban-management picker scene.
		this.dismissPickerHud(player);
		switch (which) {
			case 'general': {
				const tag = isToggleOn('particle')
					? 'gui_options_general_root_particleon'
					: 'gui_options_general_root_particleoff';
				UiBridge.openDialogue(player, tag);
				return;
			}
			case 'admin':
				UiBridge.openDialogue(player, this.isAdmin(player) ? 'gui_options_admin_root' : 'gui_options_admin_denied');
				return;
			case 'admin_reset_confirm':
				if (!this.isAdmin(player)) { UiBridge.openDialogue(player, 'gui_options_admin_denied'); return; }
				UiBridge.openDialogue(player, 'gui_options_admin_root_resetconfirm');
				player.playSound('note.pling', { pitch: 0.5  });
				return;
			case 'admin_ban':
				if (!this.isAdmin(player)) { UiBridge.openDialogue(player, 'gui_options_admin_denied'); return; }
				UiBridge.openDialogue(player, 'gui_options_admin_ban_root');
				return;
			case 'admin_toggle':
				if (!this.isAdmin(player)) { UiBridge.openDialogue(player, 'gui_options_admin_denied'); return; }
				UiBridge.openDialogue(player, `gui_options_admin_toggle_root_${adminToggleVector()}`);
				return;
			default:
				OptionsScreen.log.warn(`unknown options group '${which}'`);
		}
	}

	private handleToggle(player: Player, [, key]: string[]): void {
		if (!this.isToggleKey(key)) return;
		// Particle is the only player-facing toggle; the others require admin.
		if (key !== 'particle' && !this.isAdmin(player)) {
			UiBridge.openDialogue(player, 'gui_options_admin_denied');
			return;
		}
		flipToggle(key);
		// Reopen the relevant scene so its label/icon reflects the new state.
		if (key === 'particle') {
			this.handleOpenOptions(player, ['open_options', 'general']);
		} else {
			this.handleOpenOptions(player, ['open_options', 'admin_toggle']);
		}
	}

	private handleReset(player: Player, [, scope]: string[]): void {
		switch (scope) {
			case 'player': {
				PlayerState.for(player).reset();
				PlayerLifecycle.applyOriginAndClass(player);
				const raceStart = defaultId(PickerKind.Race);
				const mode = resolvePickMode(PickerKind.Race, raceStart, player);
				this.openPickerScene(player, PickerKind.Race, mode, raceStart);
				return;
			}
			case 'all':
				if (!this.isAdmin(player)) { UiBridge.openDialogue(player, 'gui_options_admin_denied'); return; }
				world.setDynamicProperty(WORLD_DYNAMIC_PROPERTIES.toggles, undefined);
				world.setDynamicProperty(WORLD_DYNAMIC_PROPERTIES.bans, undefined);
				resetAllToggles();
				for (const p of world.getAllPlayers()) {
					PlayerState.for(p).reset();
					PlayerLifecycle.applyOriginAndClass(p);
					const raceStart = defaultId(PickerKind.Race);
					const mode = resolvePickMode(PickerKind.Race, raceStart, p);
					this.openPickerScene(p, PickerKind.Race, mode, raceStart);
				}
				player.playSound('note.pling', { pitch: 3.0 });
				return;
			default:
				OptionsScreen.log.warn(`unknown reset scope '${scope}'`);
		}
	}

	private handleEvictUnselected(player: Player): void {
		if (!this.isAdmin(player)) { UiBridge.openDialogue(player, 'gui_options_admin_denied'); return; }
		for (const p of world.getAllPlayers()) {
			const st = PlayerState.for(p);
			if (!st.getOrigin() || !st.getClass()) {
				const raceStart = defaultId(PickerKind.Race);
				const mode = resolvePickMode(PickerKind.Race, raceStart, p);
				this.openPickerScene(p, PickerKind.Race, mode, raceStart);
			}
		}
		player.playSound('note.pling', { pitch: 3.0 });
		UiBridge.openDialogue(player, 'gui_options_admin_ban_root');
	}
}
