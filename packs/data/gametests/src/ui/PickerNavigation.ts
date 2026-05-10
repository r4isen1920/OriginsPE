import { world } from '@minecraft/server';

import { WORLD_DPK } from '../Constants';
import { Log } from '../utils/Log';
import { allIds, navigableIds } from './PickerRegistry';
import type { PickerKind, PickerMode } from './UiPayload';


//#region BANS

const log = Log.get('PickerNavigation');

/** Composes the per-id ban-set key for a given kind. */
function banKey(kind: PickerKind, id: string): string {
	return `${kind}:${id}`;
}

function readBans(): Record<string, 1> {
	const raw = world.getDynamicProperty(WORLD_DPK.bans);
	if (typeof raw !== 'string' || !raw) return {};
	try {
		const parsed = JSON.parse(raw);
		if (parsed && typeof parsed === 'object') return parsed as Record<string, 1>;
	} catch (e: any) {
		log.error(`bans parse: ${e?.stack ?? e}`);
	}
	return {};
}

function writeBans(bans: Record<string, 1>): void {
	world.setDynamicProperty(WORLD_DPK.bans, JSON.stringify(bans));
}

/** True if the given being is currently banned. */
export function isBanned(kind: PickerKind, id: string): boolean {
	return readBans()[banKey(kind, id)] === 1;
}

/** Toggles the banned flag for `id`. Returns the new state. */
export function toggleBan(kind: PickerKind, id: string): boolean {
	const bans = readBans();
	const key = banKey(kind, id);
	if (bans[key]) {
		delete bans[key];
		writeBans(bans);
		return false;
	}
	bans[key] = 1;
	writeBans(bans);
	return true;
}


//#region NAVIGATION

/**
 * Returns the id that should be shown after navigating from `currentId` in
 * `direction`. In modes that allow filtering (`pick`, `change`), banned ids
 * are skipped. In `view` and `ban` modes every id is reachable.
 *
 * The navigable set always includes the `random` sentinel at the head so the
 * cycle is `random -> human -> avian -> ... -> rootkin -> random`.
 */
export function neighborId(
	kind: PickerKind,
	mode: PickerMode,
	currentId: string,
	direction: 'prev' | 'next',
): string {
	const ids = allIds(kind);
	const len = ids.length;
	let i = ids.indexOf(currentId);
	if (i < 0) i = 0;
	const step = direction === 'next' ? 1 : -1;
	const skipBanned = mode === 'pick' || mode === 'change';

	for (let safety = 0; safety < len; safety++) {
		i = (i + step + len) % len;
		const candidate = ids[i]!;
		if (skipBanned && candidate !== 'random' && isBanned(kind, candidate)) continue;
		return candidate;
	}
	return currentId; // fallback: every navigable id banned -- stay put.
}

/** Convenience: list of currently selectable ids for `kind`. */
export function selectableIds(kind: PickerKind): readonly string[] {
	const bans = readBans();
	return navigableIds(kind).filter((id) => bans[banKey(kind, id)] !== 1);
}
