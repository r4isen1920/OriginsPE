import { Player, world } from '@minecraft/server';

import { PlayerState } from '../../core/platform/PlayerState';
import { PickerKind, PickerMode } from '../UiPayload';
import { isToggleOn } from '../OptionsState';
import { isBanned, wouldBanLimitIfBanned } from '../PickerNavigation';


//#region GUARDS

/** Narrows an arbitrary string to a {@link PickerKind}. */
export function isKind(v: string | undefined): v is PickerKind {
	return v === PickerKind.Race || v === PickerKind.Class;
}

/** Narrows an arbitrary string to a {@link PickerMode}. */
export function isMode(v: string | undefined): v is PickerMode {
	return v === PickerMode.Pick || v === PickerMode.PickBan || v === PickerMode.PickLock
		|| v === PickerMode.Change
		|| v === PickerMode.View
		|| v === PickerMode.Banned || v === PickerMode.Unbanned
		|| v === PickerMode.BanLimit || v === PickerMode.BanLocked;
}

/** True for the ban-management scene modes. */
export function isBanContextMode(mode: PickerMode): boolean {
	return mode === PickerMode.Banned || mode === PickerMode.Unbanned
		|| mode === PickerMode.BanLimit || mode === PickerMode.BanLocked;
}

/** True for the pick-flow scene modes. */
export function isPickContextMode(mode: PickerMode): boolean {
	return mode === PickerMode.Pick || mode === PickerMode.PickBan || mode === PickerMode.PickLock;
}


//#region RESOLVERS

/**
 * Resolves the correct ban-management scene mode for a given origin/class id.
 * Priority: already-banned > ban_locked (human + unique ON) > ban_limit > unbanned.
 */
export function resolveBanMode(kind: PickerKind, id: string): PickerMode {
	if (isBanned(kind, id)) return PickerMode.Banned;
	if (kind === PickerKind.Race && id === 'human' && isToggleOn('unique')) return PickerMode.BanLocked;
	if (wouldBanLimitIfBanned(kind, id)) return PickerMode.BanLimit;
	return PickerMode.Unbanned;
}

/**
 * Resolves the correct pick-mode scene variant for a given origin/class id.
 * Priority: random sentinel > banned > unique-locked > normal pick.
 */
export function resolvePickMode(kind: PickerKind, id: string, player: Player): PickerMode {
	if (id === 'random') return PickerMode.Pick;
	if (isBanned(kind, id)) return PickerMode.PickBan;
	if (isToggleOn('unique')) {
		const alreadyTaken = world.getAllPlayers().some((p) => {
			if (p.id === player.id) return false;
			const st = PlayerState.for(p);
			return kind === PickerKind.Race ? st.getOrigin() === id : st.getClass() === id;
		});
		if (alreadyTaken) return PickerMode.PickLock;
	}
	return PickerMode.Pick;
}
