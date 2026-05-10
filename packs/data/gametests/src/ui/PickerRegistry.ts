import type { PickerKind } from './UiPayload';


//#region REGISTRY

/**
 * Mirror of the navigable id ordering in `packs/data/jsonte/data.json`. Kept
 * hand-synced rather than imported because the runtime only ever needs the id
 * sequence (icons/difficulty/traits all live in the JSON UI binding layer).
 *
 * Convention: index 0 is the special `random` slot and is excluded from
 * sequential navigation. {@link nextId} / {@link prevId} cycle through the
 * remaining entries (the navigable set).
 */
const ORIGINS: readonly string[] = [
	'random',
	'human', 'avian', 'arachnid', 'elytrian', 'shulk', 'feline', 'enderian',
	'merling', 'blazeborn', 'phantom', 'kitsune', 'slimecican', 'inchling',
	'bee', 'piglin', 'starborne', 'elf', 'voidwalker', 'diviner', 'mole', 'rootkin',
];

const CLASSES: readonly string[] = [
	'random',
	'nitwit', 'archer', 'beastmaster', 'blacksmith', 'cleric', 'cook', 'explorer',
	'farmer', 'lumberjack', 'merchant', 'miner', 'rancher', 'rogue', 'warrior',
];


//#region API

/** All ids for `kind`, including the `random` sentinel at index 0. */
export function allIds(kind: PickerKind): readonly string[] {
	return kind === 'race' ? ORIGINS : CLASSES;
}

/** Sequentially navigable ids only (excludes `random`). */
export function navigableIds(kind: PickerKind): readonly string[] {
	return allIds(kind).slice(1);
}

/** True if `id` is a registered being for `kind`. */
export function isValidId(kind: PickerKind, id: string): boolean {
	return allIds(kind).includes(id);
}

/** Default id for `kind` (used when a player has no current selection). */
export function defaultId(kind: PickerKind): string {
	return kind === 'race' ? 'human' : 'nitwit';
}
