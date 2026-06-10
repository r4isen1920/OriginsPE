import { ClassRegistry, OriginRegistry } from '../domain/Registries';
import type { PickerKind } from './UiPayload';


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
	return kind === 'race' ? OriginRegistry.ids() : ClassRegistry.ids();
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
	return kind === 'race' ? OriginRegistry.has(id) : ClassRegistry.has(id);
}

/** Default id for `kind` (the first registered being). */
export function defaultId(kind: PickerKind): string {
	return registeredIds(kind)[0] ?? (kind === 'race' ? 'human' : 'nitwit');
}
