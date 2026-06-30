import { Player } from '@minecraft/server';

import { UiBridge } from '../UiBridge';
import { buildPayload, pickerSceneTag, PickerKind, PickerMode } from '../UiPayload';
import { getDifficulty } from '../PickerRegistry';


//#region SCREEN

/**
 * Base class for a self-contained picker UI screen. Each screen declares the
 * scriptevent verbs it owns and handles a dispatched, colon-split message. The
 * {@link UiRouter} builds a verb -> screen map from these declarations.
 */
export abstract class Screen {
	/** Verbs (the first colon-separated token) this screen is responsible for. */
	abstract readonly verbs: readonly string[];

	/** Handles a dispatched message already split on ':'. `parts[0]` is the verb. */
	abstract handle(player: Player, parts: string[]): void;

	/**
	 * Opens a picker dialogue scene and pushes its encoded HUD title payload in
	 * one step. Consolidates the repeated openDialogue + setTitle(buildPayload)
	 * pattern shared by the picker and ban screens.
	 */
	protected openPickerScene(player: Player, kind: PickerKind, mode: PickerMode, id: string): void {
		UiBridge.openDialogue(player, pickerSceneTag(kind, mode, id));
		player.onScreenDisplay.setTitle(
			buildPayload(mode, kind, getDifficulty(kind, id), id)
		);
	}

	/**
	 * Clears the picker HUD title channel so its window stops rendering. Used when
	 * leaving a picker scene for a screen that does not own the picker HUD layer.
	 */
	protected dismissPickerHud(player: Player): void {
		player.onScreenDisplay.setTitle('_op:');
	}
}
