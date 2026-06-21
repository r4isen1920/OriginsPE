import { Logger } from '@bedrock-oss/bedrock-boost';
import { ClassDifficulty, OriginDifficulty } from '../domain/Ability';



//#region CONSTANTS

const log = Logger.getLogger('UiPayload', 'ui');

export const DEFINITIONS = {
	prefix: '_op:picker.',
	difficulty: {
		[OriginDifficulty.Human]: 'a',
		[OriginDifficulty.Easy]: 'b',
		[OriginDifficulty.Medium]: 'c',
		[OriginDifficulty.Hard]: 'd',
		[ClassDifficulty.Nitwit]: 'f',
		[ClassDifficulty.Niche]: 'g',
		[ClassDifficulty.Decent]: 'h',
		[ClassDifficulty.Very]: 'i',
	},
} as const;


//#region TYPES

export enum PickerKind {
	Race = 'race',
	Class = 'class',
}

export enum PickerMode {
	Pick = 'pick',
	PickBan = 'pick_ban',
	PickLock = 'pick_lock',
	Change = 'change',
	View = 'view',
	Banned = 'banned',
	Unbanned = 'unbanned',
	BanLimit = 'ban_limit',
	BanLocked = 'ban_locked',
}


//#region BUILDER

/**
 * Creates a comparable output string encoding the given picker selection, matching the convention
 * baked into the jsonte template `picker_screen.templ`.
 */
export function buildPayload(
	mode: PickerMode,
	kind: PickerKind,
	difficulty: OriginDifficulty | ClassDifficulty,
	id: string,
): string {
	const payload = DEFINITIONS.prefix +	
		mode.toLowerCase().charAt(0) +
		kind.toLowerCase().charAt(0) +
		DEFINITIONS.difficulty[difficulty] +
		id;
	UI_DEBUG: {
		log.debug(`buildPayload: '${payload}'`);
	}
	return payload;
}



//#region SCENE TAGS

/**
 * Builds the dialogue `scene_tag` for a picker scene. Matches the convention
 * baked into the jsonte template `picker_screen.templ`.
 */
export function pickerSceneTag(kind: PickerKind, mode: PickerMode, id: string): string {
	return `gui_${kind}_${mode}_${id}`;
}
