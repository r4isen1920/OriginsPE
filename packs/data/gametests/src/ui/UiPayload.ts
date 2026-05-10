import { UI_PAYLOAD } from '../Constants';


//#region TYPES

export type PickerKind = 'race' | 'class';
export type PickerMode = 'pick' | 'change' | 'view' | 'ban';


//#region BUILDER

/**
 * Builds the payload string consumed by the picker JSON UI through the
 * `#dialogtext` binding. Format: `_op:<mode><kind><id>` (see {@link UI_PAYLOAD}).
 */
export function buildPayload(mode: PickerMode, kind: PickerKind, id: string): string {
	return `${UI_PAYLOAD.prefix}${UI_PAYLOAD.mode[mode]}${UI_PAYLOAD.kind[kind]}${id}`;
}

/** Reverse of {@link buildPayload}; returns null on any format mismatch. */
export function parsePayload(text: string): { mode: PickerMode; kind: PickerKind; id: string } | null {
	if (!text.startsWith(UI_PAYLOAD.prefix)) return null;
	const modeChar = text[UI_PAYLOAD.modeOffset];
	const kindChar = text[UI_PAYLOAD.kindOffset];
	const id = text.slice(UI_PAYLOAD.idOffset);
	const mode = (Object.entries(UI_PAYLOAD.mode) as Array<[PickerMode, string]>)
		.find(([, c]) => c === modeChar)?.[0];
	const kind = (Object.entries(UI_PAYLOAD.kind) as Array<[PickerKind, string]>)
		.find(([, c]) => c === kindChar)?.[0];
	if (!mode || !kind || !id) return null;
	return { mode, kind, id };
}


//#region SCENE TAGS

/**
 * Builds the dialogue `scene_tag` for a picker scene. Matches the convention
 * baked into the jsonte template `picker_screen.templ`.
 */
export function pickerSceneTag(kind: PickerKind, mode: PickerMode, id: string): string {
	return `gui_${kind}_${mode}_${id}`;
}
