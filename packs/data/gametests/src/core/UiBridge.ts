import { HudElement, Player, system, world } from '@minecraft/server';
import {
	ActionFormData,
	ActionFormResponse,
	MessageFormData,
	MessageFormResponse,
	ModalFormData,
	ModalFormResponse,
} from '@minecraft/server-ui';

import { Entities } from '../Files';
import { Log } from '../utils/Log';
import { PlayerState } from './PlayerState';


//#region TYPES
/**
 * Represents the different categories of pickers that can be opened for the player.
 */
export enum PickerKind {
	/** Shows changing Origin. */
	Race = 'race',
	/** Shows changing Class. */
	Class = 'class',
};
/**
 * Represents the different modes in which a picker can be opened, affecting both the
 * UI and the player's ability to make changes.
 */
export enum PickerMode {
	/** Displays the picker for the player to choose an option. With navigation such as left and right arrows, and a select button. */
	Pick = 'pick',
	/** Allows the player to change their current selection. With two buttons: confirm and cancel. */
	Change = 'change',
	/** Displays the current selection without allowing changes. With a single "close" button. */
	View = 'view',
}


//#region UIBRIDGE

/**
 * Thin abstraction over the dialogue + form APIs. Owns the spawn/lifecycle of
 * the `dialogue_handler` entity and replaces every legacy `runDialogueCommand`
 * call from the old `gui.ts`.
 */
export class UiBridge {
	private static readonly log = Log.get('UiBridge');


	//#region DIALOGUE

	/**
	 * Opens the named NPC dialogue for `player`, spawning a transient handler
	 * entity nearby if one is not already in range.
	 */
	static async openDialogue(player: Player, dialogueId: string): Promise<void> {
		await this.ensureHandler(player);

		player.onScreenDisplay.hideAllExcept();
		this.log.debug(`Open: '${dialogueId}', for: ${player.name}`);
		try {
			player.runCommand(
				`dialogue open @e[type=${Entities.DialogueHandler},c=1] @s ${dialogueId}`,
			);
		} catch (e: any) {
			this.log.error(`openDialogue '${dialogueId}': ${e?.stack ?? e}`);
		}

		return await system.waitTicks(1);
	}

	/** Opens the origin/class picker dialogue for the given player. */
	static async openPicker(player: Player, kind: PickerKind, mode: PickerMode = PickerMode.Pick): Promise<void> {
		const state = PlayerState.for(player);
		const current = kind === PickerKind.Race ? state.getOrigin() : state.getClass();
		const fallback = kind === PickerKind.Race ? 'human' : 'nitwit';
		const id = `gui_${kind}_${mode}_${current ?? fallback}`;

		await this.openDialogue(player, id);

		switch (mode) {
			case PickerMode.Pick:
				if (kind === PickerKind.Race) state.setOrigin(undefined);
				else state.setClass(undefined);
				break;
			case PickerMode.View:
				player.playSound('ui.enchant', { volume: 1, pitch: 1.25 });
				break;
			default: break;
		}
	}


	//#region FORMS

	/** Awaitable wrapper around `ActionFormData.show`. */
	static async showAction(player: Player, build: (form: ActionFormData) => void): Promise<ActionFormResponse> {
		const form = new ActionFormData();
		build(form);
		return form.show(player);
	}

	/** Awaitable wrapper around `MessageFormData.show`. */
	static async showMessage(player: Player, build: (form: MessageFormData) => void): Promise<MessageFormResponse> {
		const form = new MessageFormData();
		build(form);
		return form.show(player);
	}

	/** Awaitable wrapper around `ModalFormData.show`. */
	static async showModal(player: Player, build: (form: ModalFormData) => void): Promise<ModalFormResponse> {
		const form = new ModalFormData();
		build(form);
		return form.show(player);
	}


	//#region INTERNAL
	private static async ensureHandler(player: Player): Promise<void> {
		const nearby = player.dimension.getEntities({
			type: Entities.DialogueHandler,
			location: player.location,
			maxDistance: 32,
		});
		if (nearby.length > 0) return;

		try {
			player.dimension.spawnEntity(Entities.DialogueHandler, {
				x: player.location.x,
				y: player.location.y + 1,
				z: player.location.z,
			});
		} catch (e: any) {
			this.log.error(`spawn dialogue_handler: ${e?.stack ?? e}`);
		}

		return await system.waitTicks(1);
	}
}
