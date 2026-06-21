import { ClassDifficulty, OriginDifficulty } from '../core/abilities/Ability';
import { ClassRegistry, OriginRegistry } from '../core/abilities/Registries';
import { PickerKind } from './UiPayload';


//#region API

/**
 * Registered being ids for `kind`, in registration order. This mirrors the
 * domain registries (the single source of truth) rather than a hand-synced list,
 * so adding an origin/class in `domain/` automatically flows through here, the
 * emitted `jsonte` data, and the picker UI.
 *
 * The special `random` slot is not a registered being; {@link allIds} prepends it.
 */
function registeredIds(kind: PickerKind): readonly string[] {
	return kind === PickerKind.Race ? OriginRegistry.ids() : ClassRegistry.ids();
}

/** All ids for `kind`, including the `random` sentinel at index 0. */
export function allIds(kind: PickerKind): readonly string[] {
	return ['random', ...registeredIds(kind)];
}

/** Sequentially navigable ids only (excludes `random`). */
export function navigableIds(kind: PickerKind): readonly string[] {
	return registeredIds(kind);
}

/** True if `id` is a registered being for `kind`, or the `random` sentinel. */
export function isValidId(kind: PickerKind, id: string): boolean {
	if (id === 'random') return true;
	return kind === PickerKind.Race ? OriginRegistry.has(id) : ClassRegistry.has(id);
}

/** Parses and returns the difficulty for the given `id` and `kind`. */
export function getDifficulty(kind: PickerKind, id: string): OriginDifficulty | ClassDifficulty {
	return kind === PickerKind.Race
		? (OriginRegistry.get(id)?.difficulty ?? OriginDifficulty.Human)
		: (ClassRegistry.get(id)?.difficulty ?? ClassDifficulty.Nitwit);
}

/** Default id for `kind` (the first registered being). */
export function defaultId(kind: PickerKind): string {
	return registeredIds(kind)[0] ?? (kind === PickerKind.Race ? 'human' : 'nitwit');
}
