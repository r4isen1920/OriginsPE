import { UI_PAYLOAD } from '../Constants';


//#region TYPES

export type PickerKind = 'race' | 'class';
export type PickerMode =
	| 'pick' | 'pick_ban' | 'pick_lock'
	| 'change'
	| 'view'
	| 'banned' | 'unbanned'
	| 'ban_limit' | 'ban_locked';


//#region BUILDER

/**
 * Builds the payload string consumed by the picker JSON UI through the
 * `#dialogtext` binding. Format: `_op:picker.<mode><kind><diff><id>`
 * (see {@link UI_PAYLOAD}). `diff` defaults to `'j'` (the fallback bucket
 * used by the dialogue template).
 */
export function buildPayload(mode: PickerMode, kind: PickerKind, id: string, diff: string = 'j'): string {
	return `${UI_PAYLOAD.prefix}${UI_PAYLOAD.mode[mode]}${UI_PAYLOAD.kind[kind]}${diff}${id}`;
}

/** Reverse of {@link buildPayload}; returns null on any format mismatch. */
export function parsePayload(text: string): { mode: PickerMode; kind: PickerKind; diff: string; id: string } | null {
	if (!text.startsWith(UI_PAYLOAD.prefix)) return null;
	const modeChar = text[UI_PAYLOAD.modeOffset];
	const kindChar = text[UI_PAYLOAD.kindOffset];
	const diff = text[UI_PAYLOAD.diffOffset];
	const id = text.slice(UI_PAYLOAD.idOffset);
	const mode = (Object.entries(UI_PAYLOAD.mode) as Array<[PickerMode, string]>)
		.find(([, c]) => c === modeChar)?.[0];
	const kind = (Object.entries(UI_PAYLOAD.kind) as Array<[PickerKind, string]>)
		.find(([, c]) => c === kindChar)?.[0];
	if (!mode || !kind || !diff || !id) return null;
	return { mode, kind, diff, id };
}


//#region SCENE TAGS

/**
 * Builds the dialogue `scene_tag` for a picker scene. Matches the convention
 * baked into the jsonte template `picker_screen.templ`.
 */
export function pickerSceneTag(kind: PickerKind, mode: PickerMode, id: string): string {
	return `gui_${kind}_${mode}_${id}`;
}
