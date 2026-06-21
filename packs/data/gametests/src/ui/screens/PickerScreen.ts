import { Player } from '@minecraft/server';

import { PlayerState } from '../../core/platform/PlayerState';
import { PlayerLifecycle } from '../../core/abilities/PlayerLifecycle';
import { Log } from '../../utils/Log';
import { UiBridge } from '../UiBridge';
import { PickerKind, PickerMode } from '../UiPayload';
import { isValidId, defaultId, navigableIds, getDifficulty } from '../PickerRegistry';
import { neighborId } from '../PickerNavigation';
import { isKind, isMode, isBanContextMode, isPickContextMode, resolveBanMode, resolvePickMode } from '../state/PickerModeSolver';
import { Screen } from './Screen';
import { UiRouter } from '../UiRouter';


//#region PICKER SCREEN

/**
 * Handles the picker screen, which is a shared UI layer for picking and viewing
 * Origins and Classes in various contexts (onboarding, options menu, admin management).
 */
export class PickerScreen extends Screen {
	private static readonly log = Log.get('PickerScreen', 'ui');

	/** Set while a view scene was opened from the options menu, so its close button returns there. */
	static readonly VIEW_FROM_OPTIONS_FLAG = 'view_from_options';

	readonly verbs = ['nav', 'pick', 'viewed', 'change', 'open'] as const;

	handle(player: Player, parts: string[]): void {
		switch (parts[0]) {
			case 'nav': return this.handleNav(player, parts);
			case 'pick': return this.handlePick(player, parts);
			case 'viewed': return this.handleViewed(player, parts);
			case 'change': return this.handleChange(player, parts);
			case 'open': return this.handleOpen(player, parts);
		}
	}


	//#region HANDLERS

	private handleNav(player: Player, [, kind, dir, id, mode]: string[]): void {
		if (!isKind(kind) || !isMode(mode)) return;
		if (dir !== 'prev' && dir !== 'next') return;
		if (!id || !isValidId(kind, id)) return;

		const next = neighborId(kind, mode, id, dir);

		// Determine the correct scene variant for the destination id.
		const targetMode: PickerMode = isBanContextMode(mode)
			? resolveBanMode(kind, next)
			: isPickContextMode(mode)
				? resolvePickMode(kind, next, player)
				: mode; // change / view: stay in same mode.

		this.openPickerScene(player, kind, targetMode, next);
	}

	private handlePick(player: Player, [, kind, id]: string[]): void {
		if (!isKind(kind) || !id) return;
		if (id !== 'random' && !isValidId(kind, id)) return;

		const state = PlayerState.for(player);
		// Leaving the options-menu view context: the upcoming view scene belongs to
		// the onboarding/change flow, not the options menu.
		state.setFlag(PickerScreen.VIEW_FROM_OPTIONS_FLAG, undefined);
		const resolved = id === 'random' ? this.rollRandom(kind) : id;
		if (kind === PickerKind.Race) state.setOrigin(resolved);
		else state.setClass(resolved);

		this.openPickerScene(player, kind, PickerMode.View, resolved);

		player.playSound('ui.enchant', { volume: 1, pitch: 1.25 });
	}

	private handleViewed(player: Player, [, kind, id]: string[]): void {
		if (!isKind(kind) || !id || !isValidId(kind, id)) return;

		const state = PlayerState.for(player);
		// Opened from the options menu (View my Origin/Class): the close button acts
		// as a back button, returning to the General options screen.
		if (state.getFlag<boolean>(PickerScreen.VIEW_FROM_OPTIONS_FLAG) === true) {
			state.setFlag(PickerScreen.VIEW_FROM_OPTIONS_FLAG, undefined);
			UiRouter.route(player, 'open_options:general');
			return;
		}

		if (!state.getOrigin()) {
			const raceStart = defaultId(PickerKind.Race);
			const mode = resolvePickMode(PickerKind.Race, raceStart, player);
			this.openPickerScene(player, PickerKind.Race, mode, raceStart);
			return;
		}
		if (!state.getClass()) {
			const classStart = defaultId(PickerKind.Class);
			const mode = resolvePickMode(PickerKind.Class, classStart, player);
			this.openPickerScene(player, PickerKind.Class, mode, classStart);
			return;
		}

		PlayerLifecycle.applyOriginAndClass(player);

		UiBridge.closeScreen(player);
	}

	private handleChange(player: Player, [, kind, id]: string[]): void {
		if (!isKind(kind) || !id || !isValidId(kind, id)) return;
		// Open the pick picker at the current origin/class id. Does NOT commit or
		// clear state -- the player will do that via the select button in pick mode.
		const mode = resolvePickMode(kind, id, player);
		this.openPickerScene(player, kind, mode, id);
	}

	private handleOpen(player: Player, [, kind, mode, id]: string[]): void {
		if (!isKind(kind)) return;

		//* fallback to the player's current selection (e.g. "View my Origin/Class"
		//* from the options menu) before the kind default, so the scene reflects what
		//* they actually have rather than human/nitwit.
		const current = kind === PickerKind.Race
			? PlayerState.for(player).getOrigin()
			: PlayerState.for(player).getClass();
		const fallback = current && isValidId(kind, current) ? current : defaultId(kind);
		const target = id && isValidId(kind, id) ? id : fallback;
		// 'ban' is a virtual entry-point token -- resolve to the actual ban sub-mode.
		if (mode === 'ban') {
			const banMode = resolveBanMode(kind, target);
			this.openPickerScene(player, kind, banMode, target);
			return;
		}

		if (!isMode(mode)) return;
		if (mode === 'pick') {
			const pickMode = resolvePickMode(kind, target, player);
			this.openPickerScene(player, kind, pickMode, target);
			return;
		}

		// View is only reached here via the options menu (View my Origin/Class), so
		// flag it to make its close button return to the options menu.
		if (mode === 'view') PlayerState.for(player).setFlag(PickerScreen.VIEW_FROM_OPTIONS_FLAG, true);

		this.openPickerScene(player, kind, mode, target);
	}


	//#region HELPERS

	private rollRandom(kind: PickerKind): string {
		const ids = navigableIds(kind);
		return ids[Math.floor(Math.random() * ids.length)] ?? defaultId(kind);
	}
}
