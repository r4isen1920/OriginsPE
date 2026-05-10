import { world } from '@minecraft/server';

import { WORLD_DPK } from '../Constants';
import { Log } from '../utils/Log';


//#region TYPES

/**
 * The set of admin-controlled toggle keys driven by the options menu. Each
 * entry is persisted as `0` (off) or `1` (on) inside the world dynamic
 * property {@link WORLD_DPK.toggles} (a single JSON record).
 */
export type ToggleKey = 'orb' | 'paper' | 'unique' | 'announce' | 'particle';

const ALL_TOGGLES: readonly ToggleKey[] = ['orb', 'paper', 'unique', 'announce', 'particle'];

/** Default state if no value has been written yet. */
const DEFAULTS: Record<ToggleKey, 0 | 1> = {
	orb: 1,
	paper: 1,
	unique: 0,
	announce: 1,
	particle: 1,
};


//#region STATE ACCESS

const log = Log.get('OptionsState');

function readToggles(): Record<string, 0 | 1> {
	const raw = world.getDynamicProperty(WORLD_DPK.toggles);
	if (typeof raw !== 'string' || !raw) return {};
	try {
		const parsed = JSON.parse(raw);
		if (parsed && typeof parsed === 'object') return parsed as Record<string, 0 | 1>;
	} catch (e: any) {
		log.error(`toggles parse: ${e?.stack ?? e}`);
	}
	return {};
}

function writeToggles(t: Record<string, 0 | 1>): void {
	world.setDynamicProperty(WORLD_DPK.toggles, JSON.stringify(t));
}


//#region API

/** Returns the current value of `key`. Falls back to {@link DEFAULTS}. */
export function getToggle(key: ToggleKey): 0 | 1 {
	const stored = readToggles()[key];
	return stored === 0 || stored === 1 ? stored : DEFAULTS[key];
}

/** True if the toggle is enabled (value `1`). */
export function isToggleOn(key: ToggleKey): boolean {
	return getToggle(key) === 1;
}

/** Flips the toggle and returns the new state. */
export function flipToggle(key: ToggleKey): 0 | 1 {
	const current = getToggle(key);
	const next: 0 | 1 = current === 1 ? 0 : 1;
	const all = readToggles();
	all[key] = next;
	writeToggles(all);
	return next;
}

/** Returns a 4-bit string for the four admin-only toggles in scene-tag order. */
export function adminToggleVector(): string {
	const order: ToggleKey[] = ['orb', 'paper', 'unique', 'announce'];
	return order.map((k) => (isToggleOn(k) ? '1' : '0')).join('');
}

/** Reset every toggle to its default. */
export function resetAllToggles(): void {
	const out: Record<string, 0 | 1> = {};
	for (const key of ALL_TOGGLES) out[key] = DEFAULTS[key];
	writeToggles(out);
}
